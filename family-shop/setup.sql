-- Family Shop database setup. Run once in Supabase: SQL Editor > New query > paste > Run.
-- Only creates new fs_ tables and functions. Does not change any existing table.

create table public.fs_auth (id int primary key default 1 check (id=1), pin_hash text, fails int not null default 0, locked_until timestamptz);
insert into public.fs_auth(id) values (1);

create table public.fs_members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 40),
  emoji text not null default '🙂',
  created_at timestamptz not null default now());

create table public.fs_products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 60),
  category text not null check (category in ('food','drink')),
  unit text not null default 'piece',
  emoji text not null default '🛒',
  image text,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());

create table public.fs_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.fs_members(id) on delete set null,
  member_name text not null,
  product_id uuid references public.fs_products(id) on delete cascade,
  custom_text text,
  qty numeric not null default 1 check (qty > 0 and qty <= 999),
  kind text not null default 'item' check (kind in ('item','note')),
  bought boolean not null default false,
  bought_at timestamptz,
  cleared_at timestamptz,
  created_at timestamptz not null default now());
create index on public.fs_requests (cleared_at);

alter table public.fs_auth enable row level security;
alter table public.fs_members enable row level security;
alter table public.fs_products enable row level security;
alter table public.fs_requests enable row level security;

create or replace function public._fs_pin_error(p_pin text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare a public.fs_auth;
begin
  select * into a from public.fs_auth where id=1 for update;
  if a.pin_hash is null then return 'no_pin'; end if;
  if a.locked_until is not null and a.locked_until > now() then return 'locked'; end if;
  if p_pin is null or extensions.crypt(p_pin, a.pin_hash) <> a.pin_hash then
    if a.fails + 1 >= 5 then
      update public.fs_auth set fails = 0, locked_until = now() + interval '15 minutes' where id=1;
    else
      update public.fs_auth set fails = a.fails + 1 where id=1;
    end if;
    return 'wrong_pin';
  end if;
  update public.fs_auth set fails=0, locked_until=null where id=1;
  return null;
end $$;
revoke all on function public._fs_pin_error(text) from public, anon, authenticated;

create or replace function public.fs_set_pin(p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_pin !~ '^[0-9]{4}$' then return jsonb_build_object('ok',false,'error','bad_pin'); end if;
  update public.fs_auth set pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf')), fails=0, locked_until=null where id=1 and pin_hash is null;
  if not found then return jsonb_build_object('ok',false,'error','pin_exists'); end if;
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.fs_login(p_pin text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e text := public._fs_pin_error(p_pin);
begin
  if e is not null then return jsonb_build_object('ok',false,'error',e); end if;
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.fs_state() returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'ok', true,
    'has_pin', (select pin_hash is not null from fs_auth where id=1),
    'members', coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'emoji',emoji) order by created_at) from fs_members),'[]'),
    'products', coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'category',category,'unit',unit,'emoji',emoji,
        'has_image', image is not null, 'ver', floor(extract(epoch from updated_at)), 'hidden',hidden) order by lower(name)) from fs_products),'[]'),
    'requests', coalesce((select jsonb_agg(jsonb_build_object('id',id,'member_id',member_id,'member_name',member_name,'product_id',product_id,
        'text',custom_text,'qty',qty,'kind',kind,'bought',bought,'at',created_at) order by created_at) from fs_requests where cleared_at is null),'[]'));
$$;

create or replace function public.fs_images(p_ids uuid[]) returns jsonb
language sql security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(id, image),'{}') from fs_products where id = any(p_ids) and image is not null;
$$;

create or replace function public.fs_send(p_member uuid, p_items jsonb, p_note text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare m fs_members; it jsonb; q numeric; pid uuid; t text; n int := 0;
begin
  select * into m from fs_members where id = p_member;
  if not found then return jsonb_build_object('ok',false,'error','no_member'); end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 100 then return jsonb_build_object('ok',false,'error','bad_data'); end if;
  for it in select * from jsonb_array_elements(p_items) loop
    q := least(greatest(coalesce((it->>'qty')::numeric,1),0.1),999);
    pid := nullif(it->>'product_id','')::uuid;
    t := left(nullif(trim(it->>'text'),''),80);
    if pid is not null then
      if not exists (select 1 from fs_products where id=pid) then continue; end if;
      update fs_requests set qty = least(qty + q, 999) where member_id=m.id and product_id=pid and cleared_at is null and not bought and kind='item';
      if not found then insert into fs_requests(member_id,member_name,product_id,qty) values (m.id,m.name,pid,q); end if;
      n := n + 1;
    elsif t is not null then
      insert into fs_requests(member_id,member_name,custom_text,qty) values (m.id,m.name,t,q); n := n + 1;
    end if;
  end loop;
  if nullif(trim(p_note),'') is not null then
    insert into fs_requests(member_id,member_name,custom_text,kind) values (m.id,m.name,left(trim(p_note),300),'note'); n := n + 1;
  end if;
  return jsonb_build_object('ok',true,'count',n);
end $$;

create or replace function public.fs_cancel(p_member uuid, p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  delete from fs_requests where id=p_id and member_id=p_member and not bought and cleared_at is null;
  return jsonb_build_object('ok', found);
end $$;

create or replace function public.fs_product_save(p_pin text, p_id uuid, p_name text, p_category text, p_unit text, p_emoji text, p_image text, p_image_change boolean, p_hidden boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e text := public._fs_pin_error(p_pin); rid uuid;
begin
  if e is not null then return jsonb_build_object('ok',false,'error',e); end if;
  if coalesce(trim(p_name),'') = '' or p_category not in ('food','drink') or length(coalesce(p_image,'')) > 400000 then
    return jsonb_build_object('ok',false,'error','bad_data'); end if;
  if p_id is null then
    insert into fs_products(name,category,unit,emoji,image,hidden)
      values (left(trim(p_name),60),p_category,left(coalesce(p_unit,'piece'),20),left(coalesce(nullif(p_emoji,''),'🛒'),16),p_image,coalesce(p_hidden,false)) returning id into rid;
  else
    update fs_products set name=left(trim(p_name),60), category=p_category, unit=left(coalesce(p_unit,'piece'),20),
      emoji=left(coalesce(nullif(p_emoji,''),'🛒'),16), image = case when p_image_change then p_image else image end,
      hidden=coalesce(p_hidden,false), updated_at=now() where id=p_id returning id into rid;
    if rid is null then return jsonb_build_object('ok',false,'error','not_found'); end if;
  end if;
  return jsonb_build_object('ok',true,'id',rid);
end $$;

create or replace function public.fs_product_delete(p_pin text, p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e text := public._fs_pin_error(p_pin);
begin
  if e is not null then return jsonb_build_object('ok',false,'error',e); end if;
  delete from fs_products where id=p_id;
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.fs_member_save(p_pin text, p_id uuid, p_name text, p_emoji text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e text := public._fs_pin_error(p_pin);
begin
  if e is not null then return jsonb_build_object('ok',false,'error',e); end if;
  if coalesce(trim(p_name),'') = '' then return jsonb_build_object('ok',false,'error','bad_data'); end if;
  if p_id is null then
    insert into fs_members(name,emoji) values (left(trim(p_name),40), left(coalesce(nullif(p_emoji,''),'🙂'),16));
  else
    update fs_members set name=left(trim(p_name),40), emoji=left(coalesce(nullif(p_emoji,''),'🙂'),16) where id=p_id;
    update fs_requests set member_name=left(trim(p_name),40) where member_id=p_id;
  end if;
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.fs_member_delete(p_pin text, p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e text := public._fs_pin_error(p_pin);
begin
  if e is not null then return jsonb_build_object('ok',false,'error',e); end if;
  delete from fs_members where id=p_id;
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.fs_mark(p_pin text, p_ids uuid[], p_bought boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e text := public._fs_pin_error(p_pin);
begin
  if e is not null then return jsonb_build_object('ok',false,'error',e); end if;
  update fs_requests set bought=p_bought, bought_at=case when p_bought then now() end where id = any(p_ids) and cleared_at is null;
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.fs_remove(p_pin text, p_ids uuid[]) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e text := public._fs_pin_error(p_pin);
begin
  if e is not null then return jsonb_build_object('ok',false,'error',e); end if;
  delete from fs_requests where id = any(p_ids) and cleared_at is null;
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.fs_clear(p_pin text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e text := public._fs_pin_error(p_pin);
begin
  if e is not null then return jsonb_build_object('ok',false,'error',e); end if;
  update fs_requests set cleared_at=now() where cleared_at is null;
  return jsonb_build_object('ok',true);
end $$;
