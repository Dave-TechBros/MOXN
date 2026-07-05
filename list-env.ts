console.log("Environment Keys:");
for (const key of Object.keys(process.env).sort()) {
  const val = process.env[key];
  if (key.includes("KEY") || key.includes("SECRET") || key.includes("FIREBASE") || key.includes("GOOGLE") || key.includes("CRED") || key.includes("PROJECT")) {
    console.log(`  ${key}: length=${val?.length}, prefix=${val?.substring(0, 10)}`);
  } else {
    console.log(`  ${key}`);
  }
}
