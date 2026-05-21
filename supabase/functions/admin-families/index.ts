import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.4';

const corsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    'https://qqcz.top',
    'https://z324169276.github.io',
    'https://z324169276.github.io/qqcz-top',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

const json = (body: unknown, origin: string | null, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
    },
  });

export default async (req: Request) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, origin, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return json({ error: 'Missing env vars' }, origin, 500);
  }

  const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Missing Authorization header' }, origin, 401);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: 'Invalid user session' }, origin, 401);
  }

  const userId = userData.user.id;

  const { data: adminRow, error: adminError } = await userClient
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (adminError) {
    return json({ error: adminError.message }, origin, 403);
  }

  if (!adminRow) {
    return json({ error: 'Not an admin' }, origin, 403);
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, origin, 400);
  }

  const action = payload?.action as string | undefined;
  const familycode = payload?.familycode as string | undefined;

  if (!action || !familycode) {
    return json({ error: 'Missing action or familycode' }, origin, 400);
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  if (action === 'update') {
    const familyname = payload?.familyname as string | undefined;
    if (!familyname) {
      return json({ error: 'Missing familyname' }, origin, 400);
    }

    const { data, error } = await serviceClient
      .from('families')
      .update({ familyname })
      .eq('familycode', familycode)
      .select('familycode, familyname')
      .maybeSingle();

    if (error) return json({ error: error.message }, origin, 400);
    return json({ ok: true, data }, origin);
  }

  if (action === 'reset') {
    const resetData = {
      points: 0,
      tasks: [] as unknown[],
      rewards: [] as unknown[],
      history: [] as unknown[],
      members: [] as unknown[],
    };

    const { data, error } = await serviceClient
      .from('families')
      .update(resetData)
      .eq('familycode', familycode)
      .select('familycode, points, tasks, rewards, history, members')
      .maybeSingle();

    if (error) return json({ error: error.message }, origin, 400);
    return json({ ok: true, data }, origin);
  }

  if (action === 'delete') {
    const { error } = await serviceClient.from('families').delete().eq('familycode', familycode);
    if (error) return json({ error: error.message }, origin, 400);
    return json({ ok: true }, origin);
  }

  return json({ error: 'Unsupported action' }, origin, 400);
};

