import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getPrimaryApiUrl = () => process.env.NEXT_PUBLIC_PRIMARY_API_URL || 'https://api.swarmada.wiki';
const getBackupApiUrl = () => process.env.NEXT_PUBLIC_BACKUP_API_URL || 'https://api-backup.swarmada.wiki';

const checkApiHealth = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/lastModified`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json(
      { error: 'Path parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Try primary API first
    const primaryUrl = getPrimaryApiUrl();
    const isPrimaryHealthy = await checkApiHealth(primaryUrl);

    const apiUrl = isPrimaryHealthy ? primaryUrl : getBackupApiUrl();
    const fetchUrl = `${apiUrl}${path}`;

    console.log('Proxying request to:', fetchUrl);

    const response = await fetch(fetchUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API returned ${response.status} for ${fetchUrl}`);
      return NextResponse.json(
        { error: `API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from API' },
      { status: 500 }
    );
  }
}
