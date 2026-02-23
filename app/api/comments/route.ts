import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { NewComment } from '@/types/database';

export const dynamic = 'force-dynamic';
type AllowedCardType = NewComment['card_type'];
const ALLOWED_CARD_TYPES = new Set<AllowedCardType>(['ship', 'squadron', 'upgrade', 'objective']);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
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

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function isValidEmail(value: unknown): boolean {
  if (typeof value !== 'string' || !value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isAllowedCardType(value: string): value is AllowedCardType {
  return ALLOWED_CARD_TYPES.has(value as AllowedCardType);
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
    const cardType = sanitizeText(body.card_type, 32);
    const cardId = sanitizeText(body.card_id, 120);
    const authorName = sanitizeText(body.author_name, 120);
    const authorEmailRaw = body.author_email;
    const authorEmail = typeof authorEmailRaw === 'string' ? authorEmailRaw.trim().slice(0, 254) : undefined;
    const content = sanitizeText(body.content, 5000);
    const parentId = sanitizeText(body.parent_id, 120);

    if (!cardType || !cardId || !authorName || !content) {
      return NextResponse.json(
        { error: 'card_type, card_id, author_name, and content are required' },
        { status: 400 }
      );
    }

    if (!isAllowedCardType(cardType)) {
      return NextResponse.json(
        { error: 'card_type is invalid' },
        { status: 400 }
      );
    }

    if (authorEmail && !isValidEmail(authorEmail)) {
      return NextResponse.json(
        { error: 'author_email is invalid' },
        { status: 400 }
      );
    }

    const comment: NewComment = {
      card_type: cardType,
      card_id: cardId,
      author_name: authorName,
      author_email: authorEmail || undefined,
      content,
      parent_id: parentId || undefined,
    };

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const cardType = searchParams.get('card_type');
    const cardId = searchParams.get('card_id');

    if (!cardType || !cardId) {
      return NextResponse.json(
        { error: 'card_type and card_id are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('card_type', cardType)
      .eq('card_id', cardId)
      .eq('is_moderated', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
