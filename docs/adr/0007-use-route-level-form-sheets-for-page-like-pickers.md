# Use Route-Level Form Sheets For Page-Like Pickers

Cherry Mobile will use Expo Router route-level `presentation: 'formSheet'` for page-like pickers opened from chat UI, including the model picker opened from the chat input. These pickers have navigation semantics, can grow into searchable/grouped lists, and should be dismissed by Android system back before the underlying chat screen receives back.

**Considered Options**

- Render the model picker as an inline menu or popover.
- Render the model picker with a JavaScript bottom sheet component.
- Model the picker as a route-level native `formSheet`.

**Consequences**

The model picker should stay a single-screen sheet in v1: search, provider grouping, recent models, and capability labels are allowed, but nested navigation inside the Android sheet is not. The chat input should blur before opening the sheet so keyboard and bottom inset behavior can be validated cleanly.
