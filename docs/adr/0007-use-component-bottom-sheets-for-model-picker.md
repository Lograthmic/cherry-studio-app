# Use Component Bottom Sheets For Model Picker

Cherry Mobile uses the reusable `ModelPickerBottomSheet` component for model selection in both chat input and settings/model screens, instead of a route-level `formSheet`. Model selection is a short local picker shared across multiple surfaces; route-level `formSheet` remains reserved for page-like flows that need navigation history, deep linking, or page dismissal semantics.
