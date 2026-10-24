import * as fs from "fs";
import * as path from "path";

const BANNED_PATTERNS = [
  /\bSparkles\b/,
  /\bSparkle\b/,
  /\bStars\b/,
  /\bStar\b(?![a-zA-Z])/i, // catches Star icon imports from lucide
  /four-point/i,
];

function checkDirectory(dir: string, errors: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
        checkDirectory(fullPath, errors);
      }
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js|svg|css)$/.test(entry.name)) {
      // Exclude this script itself
      if (entry.name === "check-no-sparkles.ts") continue;
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        // Check imports specifically for lucide-react sparkle/star
        if (/import\s+.*(Sparkle|Sparkles|Stars).*from\s+["']lucide-react["']/.test(line)) {
          errors.push(`${fullPath}:${index + 1}: Found banned lucide icon import: ${line.trim()}`);
        } else if (/<(Sparkles|Sparkle|Stars)\b/.test(line)) {
          errors.push(`${fullPath}:${index + 1}: Found banned JSX icon element: ${line.trim()}`);
        }
      });
    }
  }
}

const errors: string[] = [];
checkDirectory(path.resolve(process.cwd(), "src"), errors);

if (errors.length > 0) {
  console.error("❌ Banned Sparkle/Stars icon check failed! Found the following occurrences:");
  errors.forEach((err) => console.error("  " + err));
  process.exit(1);
} else {
  console.log("✅ Sparkle/Stars icon check PASSED: No banned 4-pointed stars or sparkle icons found.");
  process.exit(0);
}
