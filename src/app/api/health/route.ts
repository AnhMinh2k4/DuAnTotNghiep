import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    app: "TMDT Shop",
    status: "ok",
  });
}
