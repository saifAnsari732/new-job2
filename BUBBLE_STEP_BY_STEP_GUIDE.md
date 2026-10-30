# Step-by-Step Bubble.io + n8n Setup Guide (20-Minute Quick Build)

यह गाइड खास तौर पर आपके लिए बनाई गई है ताकि अगर आप पहली बार भी Bubble.io खोल रहे हैं, तो भी **20-25 मिनट में** पूरा ऐप बना सकें।

---

## Part 1: n8n Workflow Import करना (सिर्फ 2 मिनट)

1. अपना **n8n** खोलें (Local `npx n8n` या n8n Cloud)।
2. नया Workflow बनाएं → ऊपर दाईं तरफ **`...` (Menu) -> Import from File** पर क्लिक करें।
3. अपने कंप्यूटर से यह फाइल चुनें:
   `h:\Desktop\new2\n8n\bookleaf_n8n_workflow.json`
4. **AI API Key डालना:**
   - वर्कफ़्लो में **`5. Call AI API (Gemini / LLM)`** नोड पर डबल-क्लिक करें।
   - अगर आपने n8n में `GEMINI_API_KEY` environment variable सेट नहीं किया है, तो URL के अंत में `?key={{ $env.GEMINI_API_KEY }}` की जगह सीधे अपनी Gemini API Key (`<YOUR_GEMINI_API_KEY>` जो आपके `.env.local` में है) पेस्ट कर दें।
5. ऊपर दाईं तरफ **Active / Publish** टॉगल को ON कर दें और **`1. Bubble Webhook Trigger`** नोड पर क्लिक करके उसका **Production Webhook URL** कॉपी कर लें।
   *(अगर n8n लोकल चला रहे हैं, तो `ngrok http 5678` चलाएं ताकि Bubble उसे इंटरनेट से कॉल कर सके)*।

---

## Part 2: Bubble.io में Database बनाना (5 मिनट)

1. [bubble.io](https://bubble.io) पर लॉग इन करें और **"Create an app"** पर क्लिक करके नाम रखें: `bookleaf-royalty-system` (Free plan चुनें)।
2. बाईं तरफ **Data** टैब (Database icon) खोलें → **Data types** सब-टैब में जाएं:

### 1. `User` (Built-in) में ये 2 Fields जोड़ें:
- Click **Create a new field**:
  - Field name: `role` | Field type: `text` *(Values होंगे: `"admin"` या `"author"`)*
  - Field name: `author_id` | Field type: `text` *(Values होंगे: `"AUTH001"` आदि)*

### 2. नया Data Type बनाएं: `Author`
New type बॉक्स में `Author` लिखकर **Create** दबाएं और इसमें ये Fields जोड़ें:
- `author_id` (`text`)
- `name` (`text`)
- `email` (`text`)
- `phone` (`text`)
- `city` (`text`)
- `joined_date` (`text`)
- `total_books` (`number`)
- `total_copies_sold` (`number`)
- `total_royalty_earned` (`number`)
- `total_royalty_paid` (`number`)
- `total_royalty_pending` (`number`)
- `overall_payout_status` (`text`)
- `overall_badge_color` (`text`)
- `eligible_for_bulk_summary` (`text`)
- `books_json` (`text`)

### 3. नया Data Type बनाएं: `Book`
New type बॉक्स में `Book` लिखकर **Create** दबाएं और इसमें ये Fields जोड़ें:
- `book_id` (`text`)
- `author_id` (`text`)
- `author_name` (`text`)
- `author_email` (`text`)
- `title` (`text`)
- `isbn` (`text`)
- `genre` (`text`)
- `publication_date` (`text`)
- `status` (`text`)
- `mrp` (`number`)
- `author_royalty_per_copy` (`number`)
- `total_copies_sold` (`number`)
- `total_royalty_earned` (`number`)
- `royalty_paid` (`number`)
- `royalty_pending` (`number`)
- `last_royalty_payout_date` (`text`)
- `print_partner` (`text`)
- `available_on_text` (`text`)
- `badge_color` (`text`)
- `badge_label` (`text`)

### 4. नया Data Type बनाएं: `Notification_Log`
New type बॉक्स में `Notification_Log` लिखकर **Create** दबाएं और इसमें ये Fields जोड़ें:
- `author_id` (`text`)
- `author_name` (`text`)
- `author_email` (`text`)
- `status` (`text`)
- `email_subject` (`text`)
- `email_body` (`text`)
- `error_message` (`text`)
- `triggered_at` (`text`)

---

## Part 3: डेटा को Bubble में 1-Click में डालना (Auto-Seeder Script)

आपको हाथ से 10 Authors और 18 Books टाइप करने की जरूरत नहीं है!
1. Bubble में बाईं तरफ **Settings (Gear icon) -> API** टैब में जाएं।
2. **"Enable Data API"** पर टिक करें और नीचे `Author`, `Book`, और `Notification_Log` तीनों चेकबॉक्स पर टिक कर दें।
3. नीचे **"Generate a new API token"** पर क्लिक करें।
4. अब मुझे (Antigravity को) अपना **Data API root URL** और **Private Key token** चैट में दे दें — मैं यहाँ से `node scripts/seed-bubble-api.mjs` चलाकर 5 सेकंड में सारे 10 Authors और 18 Books आपके Bubble डेटाबेस में भर दूँगा!
*(या अगर आप CSV से करना चाहें तो `h:\Desktop\new2\data\bubble_authors.csv` और `bubble_books.csv` तैयार रखे हैं)*।

---

## Part 4: Privacy Rules सेट करना (Requirement A4 — 2 मिनट)

1. Bubble में **Data -> Privacy** टैब खोलें।
2. **`Book`** पर क्लिक करें -> **"Define a new rule"** दबाएं:
   - Rule Name: `Admin Access`
   - Condition: `When Current User's role is "admin"` -> **View all fields** और **Find this in searches** टिक रखें।
   - दूसरा Rule बनाएं: `Author Own Access`
   - Condition: `When Current User's role is "author" and This Book's author_email is Current User's email` -> **View all fields** और **Find this in searches** टिक रखें।
   - नीचे **Everyone else (default permissions)** में सारे टिक हटा दें (Uncheck all)।
3. यही सेम नियम **`Author`** पर भी लगा दें (`This Author's email is Current User's email`)।

---

## Part 5: Bubble को n8n से जोड़ना (API Connector — 3 मिनट)

1. Bubble में बाईं तरफ **Plugins** टैब में जाएं → **"+ Add plugins"** पर क्लिक करें।
2. **API Connector** (Bubble द्वारा बनाया गया ऑफिशियल प्लगइन) इंस्टॉल करें।
3. **"Add another API"** पर क्लिक करें:
   - **API Name:** `n8n BookLeaf Automation`
   - नीचे Call का नाम रखें: `Trigger Royalty Summary`
   - **Use as:** `Action` (ताकि बटन के Workflow में दिखे!)
   - **Data type:** `JSON`
   - **Method:** `POST` & **URL:** अपना n8n Webhook URL डालें (जैसे `https://your-n8n-url/webhook/bookleaf-royalty-summary`)
   - **Headers:**
     - Key: `x-bookleaf-secret` | Value: `bookleaf-secret-2026` (Private टिक रखें)
     - Key: `Content-Type` | Value: `application/json`
   - **Body (JSON):** नीचे दिया गया JSON पेस्ट करें (जिसमें `< >` डायनामिक पैरामीटर्स हैं):
     ```json
     {
       "author_id": "<author_id>",
       "author_name": "<author_name>",
       "author_email": "<author_email>",
       "triggered_by": "Bubble Admin Portal"
     }
     ```
   - `author_id` की टेस्ट वैल्यू में `AUTH001`, `author_name` में `Priya Sharma`, और `author_email` में `priya.sharma@email.com` डालकर **"Initialize call"** दबाएं और **Save** कर लें!
