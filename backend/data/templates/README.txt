# How to Add Templates

This folder contains email templates that appear in the "Templates" popup in the editor.

## Quick Start

1. Create a new HTML file in this folder (e.g., `my-template.html`)
2. Add an entry to `templates.json`
3. Restart the backend server

## File Structure

```
templates/
├── templates.json      # Template manifest (REQUIRED)
├── README.txt          # This file
├── newsletter.html     # Individual template files
├── promotion.html
└── ... 
```

## templates.json Format

Each template entry requires:

```json
{
  "id": "unique-id",           // Unique identifier (no spaces)
  "name": "Display Name",       // Name shown in the UI
  "category": "Marketing",      // Category for filtering (Marketing, Sales, Social, etc.)
  "preview": "📧",              // Emoji shown as preview icon
  "file": "filename.html"       // HTML file in this folder
}
```

## Example: Adding a New Template

1. Create `my-awesome-email.html`:

```html
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h1 style="color: #333;">My Template</h1>
  <p>Your content here...</p>
</div>
```

2. Add to `templates.json`:

```json
{
  "id": "my-awesome-email",
  "name": "My Awesome Email",
  "category": "Marketing",
  "preview": "✨",
  "file": "my-awesome-email.html"
}
```

3. Restart the backend: `node server.js`

## Categories

Use these standard categories for consistency:
- **Marketing** - Newsletters, product launches, campaigns
- **Sales** - Promotions, discounts, flash sales
- **Social** - Social media, reviews, testimonials
- **Transactional** - Receipts, confirmations, shipping
- **Onboarding** - Welcome emails, getting started
- **Events** - Invitations, reminders
- **Basic** - Simple/blank templates

## Tips

- Use inline styles (email clients don't support external CSS)
- Keep max-width around 600px for email compatibility
- Test your HTML in the editor before deploying
- Use web-safe fonts (Arial, Georgia, Verdana, etc.)
