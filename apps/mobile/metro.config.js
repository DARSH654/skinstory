const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports resolution (required for modern ES subpath exports in Expo 56 / Supabase 2.117+)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
