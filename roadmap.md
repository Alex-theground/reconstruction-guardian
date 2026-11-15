# Tasks

- [x] Add an apartment audit page covering scope, process, reporting, and engagement boundaries.
- [x] Connect the page from the header and footer and check navigation on desktop and mobile.
- [x] Add service-type selection (조합 감독 / 아파트감사) to the contact form, stored in contact_inquiries.service_type and shown in the admin inquiry list and Telegram notification.
- [ ] Finish Telegram notification setup (deferred by user): user must message @dh_agentsbot once, then fetch chat_id via getUpdates and set TELEGRAM_CHAT_ID secret.
- [x] Check contact details, submit both service types, and verify saved inquiries (two clearly labeled test inquiries saved; no runtime errors or mobile overflow).
- [ ] Replace unverified contact phone, old-brand email, and incomplete office address once the user supplies actual details.