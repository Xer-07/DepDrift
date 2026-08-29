import { renderDate } from "@demo/ui";
import { formatDate } from "@demo/utils"; // missing from package.json!

console.log(renderDate(new Date()));
console.log(formatDate(new Date()));