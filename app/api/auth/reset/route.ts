import { NextResponse } from "next/server";

import { requestPasswordResetAction } from "@/app/actions/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const state = await requestPasswordResetAction({}, form);

  if (state.error) {
    return NextResponse.json(state, { status: 400 });
  }

  return NextResponse.json(state);
}
