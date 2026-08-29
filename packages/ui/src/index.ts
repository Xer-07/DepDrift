import axios from "axios";
import { formatDate } from "@demo/utils";
export function renderDate(date: Date) {
  axios.get("/api/date");
  return formatDate(date);
}