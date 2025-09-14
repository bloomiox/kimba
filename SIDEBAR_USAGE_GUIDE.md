# Sidebar Enhancement Usage Guide

## Quick Start

The enhanced sidebar provides three main customization features:

### 🎯 **Drag & Drop Reordering**

1. **Enable Customization Mode**
   - Click the settings icon (⚙️) in the sidebar header
   - The sidebar will show "Drag items to reorder" message
   - Menu items become draggable

2. **Reorder Items**
   - Click and drag any menu item to a new position
   - Visual indicators show where the item will be dropped
   - Release to drop the item in the new position
   - Changes are saved automatically

### 👥 **Menu Grouping**

1. **Open Advanced Settings**
   - Click the list icon (📋) next to the settings icon
   - This opens the advanced menu customizer dialog

2. **Create Groups**
   - Select 2 or more menu items using checkboxes
   - Click "Group Selected" button
   - Enter a name for your group
   - Click "Create Group"

3. **Manage Groups**
   - Groups appear with chevron icons (▶)
   - Click to expand/collapse groups
   - In customization mode, click "Ungroup" to dissolve groups
   - Drag items into/out of groups

### 👁️ **Hide/Show Items**

1. **Quick Hide (Customization Mode)**
   - Enable customization mode (⚙️ icon)
   - Hover over any menu item
   - Click "Hide" button that appears
   - Item disappears from the menu

2. **Advanced Management**
   - Open advanced settings (📋 icon)
   - View "Hidden Menu Items" section
   - Click "Show" to restore hidden items
   - Use "Show All" to restore all hidden items

### 🔄 **Reset & Restore**

1. **Reset to Default**
   - In customization mode: Click "Reset" button
   - In advanced settings: Click "Reset to Default"
   - This restores the original menu layout

2. **Show All Items**
   - In customization mode: Click "Show All"
   - In advanced settings: Click "Show All" button
   - This makes all hidden items visible again

## Troubleshooting

### Drag & Drop Not Working

1. **Check Customization Mode**
   - Make sure the settings icon (⚙️) is highlighted/active
   - You should see the customization message at the top

2. **Browser Compatibility**
   - Ensure your browser supports HTML5 drag & drop
   - Try refreshing the page if drag events aren't working

3. **Console Debugging**
   - Open browser developer tools (F12)
   - Check console for drag event messages
   - Look for any JavaScript errors

### Grouping Issues

1. **Selection Requirements**
   - You need to select at least 2 items to create a group
   - Make sure checkboxes are checked before clicking "Group Selected"

2. **Group Names**
   - Group names cannot be empty
   - Use descriptive names for better organization

### Items Not Saving

1. **Settings Context**
   - Make sure the component is wrapped in `SettingsProvider`
   - Check that user is authenticated if using database storage

2. **Local Storage**
   - Settings are saved to user preferences
   - Clear browser cache if experiencing issues

## Advanced Tips

### Organizing Your Menu

1. **Group Related Items**
   - Group "Analytics" and "Report" together
   - Create "Customer Management" group with "Clients" and "Booking"
   - Group "Sales" items like "POS" and "Products"

2. **Hide Unused Features**
   - Hide features you don't use regularly
   - Keep frequently used items at the top
   - Use groups to reduce visual clutter

3. **Logical Ordering**
   - Put most-used items first
   - Group related functionality
   - Consider workflow when ordering items

### Keyboard Accessibility

- All functionality is keyboard accessible
- Use Tab to navigate between elements
- Use Enter/Space to activate buttons
- Screen readers announce drag & drop operations

### Mobile Considerations

- Touch drag & drop is supported on mobile devices
- Tap and hold to start dragging
- Advanced settings dialog is responsive
- Consider hiding less-used items on mobile

## Technical Notes

- All customizations are saved to user settings
- Changes persist across browser sessions
- Menu structure is versioned for future migrations
- Drag & drop uses native HTML5 APIs for best performance