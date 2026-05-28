
"""
send_bulk_emails.py — Send custom emails to users who logged in last 24 hours

Usage:
    python send_bulk_emails.py "Your custom message here"

Example:
    python send_bulk_emails.py "🕉 नमस्ते! आपके ShivaMarg पर नए लेख प्रकाशित हुए हैं।"

Requires:
    - pip install python-dotenv resend pymongo
    - .env file with MONGO_URI, RESEND_API_KEY
"""

"""
send_bulk_emails_zoho.py — Send custom emails to users who logged in last 24 hours via Zoho SMTP

Usage:
    python send_bulk_emails_zoho.py "Your custom message here"

Example:
    python send_bulk_emails_zoho.py "🕉 नमस्ते! आपके ShivaMarg पर नए लेख प्रकाशित हुए हैं।"

Requires:
    - pip install python-dotenv pymongo
    - .env file with MONGO_URI, ZOHO_EMAIL, ZOHO_PASSWORD
"""

import os
import sys
import smtplib
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Load environment variables from .env
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("bulk_emails_zoho")

# ─────────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────────

# Zoho SMTP
ZOHO_EMAIL = "shivmarg@shivmarg.live"
ZOHO_PASSWORD = ""
EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "ShivaMarg")

# MongoDB
MONGO_URI = ""
DB_NAME = "ShivMarg"
USERS_COLLECTION = "users"  # Change to your collection name

# ─────────────────────────────────────────────
#  EMAIL TEMPLATE
# ─────────────────────────────────────────────

def _build_custom_email_html(display_name: str, custom_message: str) -> str:
    """Build HTML email with custom message"""
    year = datetime.utcnow().year
    return f"""<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShivaMarg संदेश</title>
</head>
<body style="margin:0;padding:0;background-color:#fdf6ec;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#fdf6ec;padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;background:#ffffff;border-radius:16px;
                      overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#b5451b 0%,#e07b39 100%);
                        padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;
                          letter-spacing:1px;">🕉 ShivaMarg</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;
                         letter-spacing:2px;text-transform:uppercase;">
                आध्यात्मिक ज्ञान का मार्ग
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 32px;">

              <!-- Greeting -->
              <h2 style="margin:0 0 16px;color:#2d1a0e;font-size:24px;font-weight:500;">
                नमस्ते, {display_name}! 🙏
              </h2>

              <!-- Custom Message -->
              <div style="color:#4a3728;font-size:16px;line-height:1.7;margin:0 0 28px;">
                {custom_message}
              </div>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f0e6d3;margin:0 0 28px;">

              <!-- Footer note -->
              <p style="margin:0;color:#7c6b4e;font-size:13px;line-height:1.6;">
                यह एक स्वचालित संदेश है। कृपया इसका उत्तर न दें।
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#2d1a0e;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#e07b39;font-size:16px;font-weight:700;">
                🕉 ShivaMarg
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">
                © {year} ShivaMarg. सर्वाधिकार सुरक्षित।
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>"""


def _build_custom_email_text(display_name: str, custom_message: str) -> str:
    """Build plain text email with custom message"""
    return f"""नमस्ते {display_name},

{custom_message}

— ShivaMarg Team
"""


# ─────────────────────────────────────────────
#  MONGODB FUNCTIONS
# ─────────────────────────────────────────────

def get_users_active_last_24hrs():
    """
    Get all users who logged in the last 24 hours from MongoDB.
    
    This assumes your MongoDB has a structure like:
    - users collection with: _id, email, display_name, username, last_login
    
    Adjust the query based on YOUR actual MongoDB structure!
    """
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        
        # Calculate 24 hours ago
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        
        logger.info(f"🔗 Connecting to MongoDB...")
        logger.info(f"🔍 Looking for users active since: {twenty_four_hours_ago}")
        
        # ⚠️ ADJUST THIS QUERY BASED ON YOUR DATABASE STRUCTURE
        # Example 1: If users have 'last_login' field directly
        users = list(db[USERS_COLLECTION].find({
            "created_at": {"$gte": twenty_four_hours_ago}
        }, {
            "_id": 1,
            "email": 1,
            "display_name": 1,
            "username": 1
        }))
        
        client.close()
        
        logger.info(f"✅ Found {len(users)} users active in last 24 hours")
        return users
    
    except Exception as e:
        logger.error(f"❌ MongoDB error: {e}")
        logger.error(f"   Check your MONGO_URI in .env file")
        return []


# ─────────────────────────────────────────────
#  ZOHO SMTP SENDER
# ─────────────────────────────────────────────

def send_email_via_zoho(to_email: str, display_name: str, custom_message: str) -> bool:
    """
    Send single email via Zoho SMTP (port 465 + SSL, with fallback to 587)
    """
    try:
        # Build email message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🕉 ShivaMarg से आपके लिए संदेश"
        msg["From"] = f"{EMAIL_FROM_NAME} <{ZOHO_EMAIL}>"
        msg["To"] = to_email

        # Attach plain text version
        msg.attach(
            MIMEText(
                _build_custom_email_text(display_name, custom_message),
                "plain",
                "utf-8"
            )
        )

        # Attach HTML version
        msg.attach(
            MIMEText(
                _build_custom_email_html(display_name, custom_message),
                "html",
                "utf-8"
            )
        )

        # Try port 465 first (SMTP_SSL)
        try:
            logger.debug(f"  Trying port 465 (SMTP_SSL)...")
            with smtplib.SMTP_SSL("smtp.zoho.in", 465, timeout=15) as server:
                server.login(ZOHO_EMAIL, ZOHO_PASSWORD)
                server.sendmail(ZOHO_EMAIL, to_email, msg.as_string())
            logger.info(f"✅ Sent to {to_email} (port 465)")
            return True
        
        except (smtplib.SMTPException, TimeoutError, OSError) as e:
            # Port 465 failed, try port 587 with STARTTLS
            logger.debug(f"  Port 465 failed: {type(e).__name__} — Trying port 587...")
            
            with smtplib.SMTP("smtp.zoho.in", 587, timeout=15) as server:
                server.starttls()
                server.login(ZOHO_EMAIL, ZOHO_PASSWORD)
                server.sendmail(ZOHO_EMAIL, to_email, msg.as_string())
            
            logger.info(f"✅ Sent to {to_email} (port 587 fallback)")
            return True

    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"❌ Auth failed for {to_email}: {e}")
        logger.error(f"   Check ZOHO_EMAIL and ZOHO_PASSWORD in .env")
        return False

    except Exception as e:
        logger.error(f"❌ Failed to send to {to_email}: {type(e).__name__}: {e}")
        return False


# ─────────────────────────────────────────────
#  BULK SENDER
# ─────────────────────────────────────────────

def send_bulk_emails(custom_message: str, dry_run: bool = False):
    """
    Send emails to all users who logged in last 24 hours.
    
    Args:
        custom_message: The message to send (in Hindi/English)
        dry_run: If True, show what would be sent without actually sending
    """
    
    if not ZOHO_EMAIL or not ZOHO_PASSWORD:
        logger.error("❌ ZOHO_EMAIL or ZOHO_PASSWORD not set in .env")
        return False
    
    if not custom_message or custom_message.strip() == "":
        logger.error("❌ Custom message is empty")
        return False
    
    # Get users
    users = get_users_active_last_24hrs()
    
    if not users:
        logger.warning("⚠️  No users found who logged in last 24 hours")
        return False
    
    logger.info(f"\n📧 Starting to send {len(users)} emails...")
    logger.info(f"💬 Message: {custom_message[:60]}...")
    logger.info(f"📤 From: {ZOHO_EMAIL}\n")
    
    # Track stats
    success_count = 0
    failed_count = 0
    failed_emails = []
    
    # Send to each user
    for idx, user in enumerate(users, 1):
        email = user.get("email", "")
        display_name = user.get("display_name", user.get("username", "User"))
        
        if not email:
            logger.warning(f"⚠️  User {display_name} has no email, skipping")
            continue
        
        logger.info(f"[{idx}/{len(users)}] Sending to {email}...")
        
        if dry_run:
            logger.info("[DRY RUN]")
        else:
            # Actually send
            if send_email_via_zoho(email, display_name, custom_message):
                success_count += 1
            else:
                failed_count += 1
                failed_emails.append(email)
    
    # Summary
    logger.info("\n" + "="*60)
    logger.info("📊 EMAIL CAMPAIGN SUMMARY")
    logger.info("="*60)
    logger.info(f"✅ Successful: {success_count}")
    logger.info(f"❌ Failed: {failed_count}")
    logger.info(f"📧 Total: {success_count + failed_count}")
    
    if failed_emails:
        logger.info(f"\n❌ Failed emails:")
        for email in failed_emails:
            logger.info(f"   - {email}")
    
    logger.info("="*60 + "\n")
    
    return success_count > 0


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────

if __name__ == "__main__":
    
    if len(sys.argv) < 2:
        print("❌ Usage: python send_bulk_emails_zoho.py \"Your message here\"")
        print("\nExamples:")
        print('  python send_bulk_emails_zoho.py "🕉 नमस्ते! नए लेख प्रकाशित हुए हैं।"')
        print('  python send_bulk_emails_zoho.py "Welcome to ShivaMarg!"')
        print('\n  python send_bulk_emails_zoho.py "Test message" --dry-run')
        sys.exit(1)
    
    custom_message = sys.argv[1]
    dry_run = "--dry-run" in sys.argv
    
    if dry_run:
        logger.info("🔍 DRY RUN MODE - No emails will be sent\n")
    
    success = send_bulk_emails(custom_message, dry_run=dry_run)
    
    sys.exit(0 if success else 1)