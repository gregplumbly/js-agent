// JavaScript Trick: The Nullish Coalescing Operator (??)
// This operator provides a smarter way to handle default values compared to the || operator

// The traditional OR (||) operator can sometimes give unexpected results
// because it checks for "falsy" values (0, '', false, null, undefined)
const count = 0;
const defaultCount = 5;
const resultWithOR = count || defaultCount;
console.log('Using OR operator:', resultWithOR);  // Prints: 5 (not what we wanted!)

// The nullish coalescing operator (??) only checks for null or undefined
const resultWithNullish = count ?? defaultCount;
console.log('Using ?? operator:', resultWithNullish);  // Prints: 0 (what we wanted!)

// More examples:
console.log('Empty string with ||:', '' || 'default');  // Prints: "default"
console.log('Empty string with ??:', '' ?? 'default');  // Prints: ""
console.log('Zero with ||:', 0 || 42);                 // Prints: 42
console.log('Zero with ??:', 0 ?? 42);                 // Prints: 0
console.log('null with ??:', null ?? 'default');       // Prints: "default"
console.log('undefined with ??:', undefined ?? 'default'); // Prints: "default"

// Real-world example: Setting default values for function parameters
function getUserPreference(preference = {}) {
    return {
        theme: preference.theme ?? 'light',
        fontSize: preference.fontSize ?? 16,
        notifications: preference.notifications ?? true
    };
}

console.log('\nDefault preferences:', getUserPreference());
console.log('Custom preferences:', getUserPreference({ theme: 'dark', fontSize: 0, notifications: false }));