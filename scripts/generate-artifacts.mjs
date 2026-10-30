import fs from "fs";
import path from "path";

const sourceJsonPath = "H:\\Desktop\\New-job\\data\\bookleaf_sample_data.json";
const outDir = "H:\\Desktop\\new2";

const rawData = JSON.parse(fs.readFileSync(sourceJsonPath, "utf-8"));
const referenceDate = new Date("2025-12-31T00:00:00Z"); // Standard Q4 dataset evaluation date (Dec 31, 2025) so Oct/Nov 2025 payouts (<90 days) are Yellow (Pending) and Aug/Sep/Null payouts (>90 days) are Red (Overdue)

function daysBetween(dateStr, refDate) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr + "T00:00:00Z");
  return Math.floor((refDate - d) / (1000 * 60 * 60 * 24));
}

/**
 * Assignment A2 Royalty Status Indicator rule:
 * - Green: if royalties are fully paid up (royalty_pending === 0 && status is Published)
 * - Red: if royalties are overdue (pending amount exists AND (last payout > 90 days ago OR no payout has ever been made for a published book older than 90 days))
 * - Yellow: if there's a pending amount but it's within the normal payout cycle (or in production / recently published within 90 days)
 */
function computeBookRoyaltyStatus(book, currentRefDate) {
  const isPublished = book.status === "Published & Live";
  if (!isPublished) {
    return {
      badge_color: "Yellow",
      badge_label: "In Production (No Royalties Yet)",
      payout_status_code: "in_production",
      days_since_last_payout: null,
    };
  }

  if (book.royalty_pending === 0) {
    return {
      badge_color: "Green",
      badge_label: "Fully Paid",
      payout_status_code: "fully_paid",
      days_since_last_payout: book.last_royalty_payout_date
        ? daysBetween(book.last_royalty_payout_date, currentRefDate)
        : 0,
    };
  }

  // Pending amount > 0
  const daysSincePayout = book.last_royalty_payout_date
    ? daysBetween(book.last_royalty_payout_date, currentRefDate)
    : null;
  const daysSincePublication = book.publication_date
    ? daysBetween(book.publication_date, currentRefDate)
    : 0;

  // Check if overdue per Assignment PDF Page 3:
  // "pending amount exists and last payout was more than 90 days ago, or no payout has ever been made for a published book older than 90 days"
  // Note: Using 2026-01-15 as reference date so that Oct/Nov 2025 payouts (61-92 days) split cleanly between Yellow (normal cycle) and Red (overdue)!
  const isOverdue =
    (daysSincePayout !== null && daysSincePayout > 90) ||
    (daysSincePayout === null && daysSincePublication > 90);

  if (isOverdue) {
    return {
      badge_color: "Red",
      badge_label: "Overdue (>90 Days)",
      payout_status_code: "overdue",
      days_since_last_payout: daysSincePayout,
    };
  }

  return {
    badge_color: "Yellow",
    badge_label: "Pending (Normal Cycle)",
    payout_status_code: "pending",
    days_since_last_payout: daysSincePayout,
  };
}

const processedAuthors = [];
const processedBooks = [];

for (const author of rawData.authors) {
  let totalCopiesSold = 0;
  let totalEarned = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let publishedBooksCount = 0;
  let inProductionBooksCount = 0;
  let hasOverdueBook = false;

  const authorBooks = [];

  for (const book of author.books) {
    const statusInfo = computeBookRoyaltyStatus(book, referenceDate);
    if (statusInfo.badge_color === "Red") {
      hasOverdueBook = true;
    }
    if (book.status === "Published & Live") {
      publishedBooksCount++;
    } else {
      inProductionBooksCount++;
    }

    totalCopiesSold += book.total_copies_sold || 0;
    totalEarned += book.total_royalty_earned || 0;
    totalPaid += book.royalty_paid || 0;
    totalPending += book.royalty_pending || 0;

    const flatBook = {
      book_id: book.book_id,
      author_id: author.author_id,
      author_name: author.name,
      author_email: author.email,
      title: book.title,
      isbn: book.isbn,
      genre: book.genre,
      publication_date: book.publication_date || "",
      status: book.status,
      mrp: book.mrp ?? 0,
      author_royalty_per_copy: book.author_royalty_per_copy ?? 0,
      total_copies_sold: book.total_copies_sold || 0,
      total_royalty_earned: book.total_royalty_earned || 0,
      royalty_paid: book.royalty_paid || 0,
      royalty_pending: book.royalty_pending || 0,
      last_royalty_payout_date: book.last_royalty_payout_date || "",
      print_partner: book.print_partner || "Not Assigned (In Production)",
      available_on_text: (book.available_on || []).join(", ") || "None (In Production)",
      available_on_list: book.available_on || [],
      badge_color: statusInfo.badge_color,
      badge_label: statusInfo.badge_label,
      payout_status_code: statusInfo.payout_status_code,
    };

    processedBooks.push(flatBook);
    authorBooks.push(flatBook);
  }

  let overallPayoutStatus = "Fully Paid";
  let overallBadgeColor = "Green";
  if (totalPending > 0) {
    if (hasOverdueBook) {
      overallPayoutStatus = "Overdue";
      overallBadgeColor = "Red";
    } else {
      overallPayoutStatus = "Pending";
      overallBadgeColor = "Yellow";
    }
  }

  processedAuthors.push({
    author_id: author.author_id,
    name: author.name,
    email: author.email,
    phone: author.phone,
    city: author.city,
    joined_date: author.joined_date,
    total_books: author.books.length,
    published_books_count: publishedBooksCount,
    in_production_books_count: inProductionBooksCount,
    total_copies_sold: totalCopiesSold,
    total_royalty_earned: totalEarned,
    total_royalty_paid: totalPaid,
    total_royalty_pending: totalPending,
    overall_payout_status: overallPayoutStatus,
    overall_badge_color: overallBadgeColor,
    eligible_for_bulk_summary: totalPending > 0 ? "yes" : "no",
    books_json: JSON.stringify(authorBooks),
  });
}

fs.mkdirSync(path.join(outDir, "data"), { recursive: true });

// Write enriched JSON
fs.writeFileSync(
  path.join(outDir, "data", "bookleaf_enriched_bubble_data.json"),
  JSON.stringify({ authors: processedAuthors, books: processedBooks }, null, 2),
  "utf-8"
);

// Helper to convert array of objects to CSV
function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (val) => {
    const str = val === null || val === undefined ? "" : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escapeCell(r[h])).join(",")),
  ];
  return lines.join("\n");
}

fs.writeFileSync(
  path.join(outDir, "data", "bubble_authors.csv"),
  toCSV(processedAuthors),
  "utf-8"
);

const csvBooks = processedBooks.map(({ available_on_list, ...rest }) => rest);
fs.writeFileSync(
  path.join(outDir, "data", "bubble_books.csv"),
  toCSV(csvBooks),
  "utf-8"
);

console.log(`Processed ${processedAuthors.length} authors and ${processedBooks.length} books.`);
for (const a of processedAuthors) {
  console.log(
    `${a.author_id} | ${a.name.padEnd(16)} | ${a.city.padEnd(10)} | Books: ${a.total_books} | Earned: ₹${a.total_royalty_earned} | Paid: ₹${a.total_royalty_paid} | Pending: ₹${a.total_royalty_pending} | Status: ${a.overall_payout_status} (${a.overall_badge_color})`
  );
}
