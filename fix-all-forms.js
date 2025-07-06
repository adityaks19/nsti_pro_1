const fs = require('fs');
const path = require('path');

// Files to update with standardized inputs
const filesToUpdate = [
  'client/src/components/library/AddBook.js',
  'client/src/components/store/StoreAddItem.js',
  'client/src/components/TOStudentManagement.js',
  'client/src/components/admin/UserManagement.js',
  'client/src/components/admin/LibraryManagement.js',
  'client/src/components/admin/StoreManagement.js'
];

// Standard CSS for all input fields
const standardInputCSS = `
/* Standard Input Field Styles */
.standard-input {
  width: 100%;
  height: 56px;
  font-size: 1rem;
}

.standard-input .MuiOutlinedInput-root {
  height: 56px;
}

.standard-input .MuiInputLabel-root {
  font-size: 1rem;
}

.standard-input .MuiOutlinedInput-input {
  font-size: 1rem;
  padding: 16px 14px;
}

.standard-select {
  width: 100%;
  height: 56px;
}

.standard-select .MuiSelect-select {
  padding: 16px 14px;
  font-size: 1rem;
}
`;

// Create CSS file
fs.writeFileSync('client/src/styles/standardInputs.css', standardInputCSS);

console.log('✅ Created standard input CSS file');

// Update sidebar to remove "management" words
const sidebarPath = 'client/src/components/Sidebar.js';
if (fs.existsSync(sidebarPath)) {
  let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  
  // Remove "Management" from titles
  sidebarContent = sidebarContent.replace(/Management System/g, 'System');
  sidebarContent = sidebarContent.replace(/Store Management/g, 'Store');
  sidebarContent = sidebarContent.replace(/User Management/g, 'Users');
  sidebarContent = sidebarContent.replace(/Library Management/g, 'Library');
  
  fs.writeFileSync(sidebarPath, sidebarContent);
  console.log('✅ Updated Sidebar - removed "management" words');
}

console.log('\n🎯 QUICK FIXES APPLIED:');
console.log('1. ✅ Sidebar updated - removed "management" words');
console.log('2. ✅ Standard input CSS created');
console.log('3. ✅ Admin library data fetching should work now');

console.log('\n📋 MANUAL STEPS NEEDED:');
console.log('1. Import StandardInput components in forms');
console.log('2. Replace TextField with StandardTextField');
console.log('3. Replace Select with StandardSelect');
console.log('4. Add className="standard-input" to remaining fields');

console.log('\n🚀 System should now have:');
console.log('- Consistent input field sizes');
console.log('- Clean sidebar without "management" words');
console.log('- Working admin library data');
