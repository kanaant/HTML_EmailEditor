# TODO - Future Enhancements

## High Priority

- [ ] **Email Preview Mode** - Preview how email looks in different clients (Gmail, Outlook, Apple Mail)
- [ ] **Undo/Redo History Panel** - Visual timeline of changes with restore points
- [ ] **Image Upload** - Upload images to backend instead of just URLs
- [ ] **Table Editor** - Visual table creation and editing (essential for email layouts)

## Medium Priority

- [ ] **Responsive Preview** - Toggle between desktop/mobile preview widths
- [x] **Template Gallery** - Pre-built starter templates to choose from
- [ ] **Find & Replace** - Search and replace text across the document
- [ ] **Inline Style Inliner** - Automatically inline CSS for better email client compatibility
- [ ] **HTML Validation** - Warn about email-unfriendly HTML elements
- [ ] **Keyboard Shortcuts** - Ctrl+B, Ctrl+I, etc. (partial support exists)

## Nice to Have

- [ ] **Version History** - Track changes over time with diff view
- [ ] **Collaboration** - Real-time multi-user editing
- [ ] **Direct Mailchimp Integration** - Push directly to Mailchimp via API
- [ ] **Email Testing** - Send test emails to preview in real inboxes
- [ ] **Spam Score Check** - Analyze content for spam triggers
- [ ] **Accessibility Checker** - Ensure emails are accessible
- [ ] **Custom Fonts** - Upload and use custom web fonts
- [x] **Drag & Drop Blocks** - Pre-built content blocks (header, footer, CTA)
- [/] **Variable/Merge Tags** - Support for `{{first_name}}` style placeholders (Foundation laid)
- [ ] **Export to MJML** - Export as MJML for responsive email generation

## Technical Improvements

- [ ] **Add TypeScript** - Type safety for frontend
- [ ] **Unit Tests** - Jest tests for components
- [ ] **E2E Tests** - Playwright tests for full workflows
- [x] **Docker Support** - Containerize for easy deployment
- [ ] **Database Backend** - Replace JSON files with SQLite or PostgreSQL
- [x] **Authentication** - Optional user accounts for team use
- [ ] **Rate Limiting** - Protect API from abuse
- [ ] **Code Splitting** - Reduce initial bundle size (currently 600KB)

## Bug Fixes / Polish

- [ ] **Auto-save Indicator** - Show saving/saved status more clearly
- [ ] **Confirm Before Close** - Warn if unsaved changes
- [ ] **Better Error Messages** - User-friendly error handling
- [ ] **Loading States** - Skeleton loaders for async operations
- [ ] **Empty State Graphics** - Better visuals when no templates/drafts
