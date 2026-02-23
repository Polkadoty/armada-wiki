import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { NewBugReport } from '@/types/database';

export const dynamic = 'force-dynamic';
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestBuckets = new Map<string, number[]>();

function getClientKey(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return ip || 'unknown';
}

function isRateLimited(request: NextRequest): boolean {
  const now = Date.now();
  const key = getClientKey(request);
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const previous = requestBuckets.get(key) || [];
  const recent = previous.filter((timestamp) => timestamp > windowStart);
  recent.push(now);
  requestBuckets.set(key, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function isValidEmail(value: unknown): boolean {
  if (typeof value !== 'string' || !value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function validateBugReport(body: Record<string, unknown>) {
  const title = sanitizeText(body.title, 200);
  const description = sanitizeText(body.description, 5000);
  const stepsToReproduce = sanitizeText(body.steps_to_reproduce, 5000);
  const expectedBehavior = sanitizeText(body.expected_behavior, 3000);
  const actualBehavior = sanitizeText(body.actual_behavior, 3000);
  const pageUrl = sanitizeText(body.page_url, 500);
  const contactEmailRaw = body.contact_email;
  const contactEmail = typeof contactEmailRaw === 'string' ? contactEmailRaw.trim().slice(0, 254) : undefined;

  if (!title || !description) {
    return { error: 'title and description are required' };
  }

  if (contactEmail && !isValidEmail(contactEmail)) {
    return { error: 'contact_email is invalid' };
  }

  return {
    data: {
      title,
      description,
      steps_to_reproduce: stepsToReproduce || undefined,
      expected_behavior: expectedBehavior || undefined,
      actual_behavior: actualBehavior || undefined,
      page_url: pageUrl || undefined,
      contact_email: contactEmail || undefined,
    } satisfies NewBugReport
  };
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured. Please set up Supabase credentials in .env.local' },
      { status: 503 }
    );
  }

  try {
    if (isRateLimited(request)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json() as Record<string, unknown>;
    const validated = validateBugReport(body);
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const bugReport = validated.data;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('bug_reports')
      .insert([bugReport])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create bug report' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating bug report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const adminToken = process.env.BUG_REPORTS_ADMIN_TOKEN;
  const providedToken = request.headers.get('x-admin-token');

  if (!adminToken || !providedToken || providedToken !== adminToken) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabase = getSupabase();
    let query = supabase
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bug reports' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
