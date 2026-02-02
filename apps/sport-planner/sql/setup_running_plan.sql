-- Sport Planner — Running plan setup (idempotent)
-- Creates/updates 4 aerobic running works and configures personal plan groups by weekday:
-- - Wednesday: TEMPO or UMBRAL (1 item)
-- - Friday: EASY (1 item)
-- - Sunday: LONG RUN (1 item)
--
-- This script is safe to run multiple times:
-- - Uses UPSERT for works (by id).
-- - Rewrites plan groups to avoid duplicates (by group id).
--
-- NOTE: This updates `planner_states.data` (JSON) for a specific user.
-- Adjust `user_id` below if needed.

begin;

-- 0) Parameters
with params as (
  select
    '6c3b5aa5-ee38-48ec-8c48-14e368a69f53'::uuid as user_id,
    'maballesteros@gmail.com'::text as owner_email
),
owner as (
  select (select user_id from params) as owner_id, (select owner_email from params) as owner_email
),
objective as (
  -- Reuse any existing objective_id already used by aerobic works (if present).
  select objective_id
  from works
  where owner_id = (select owner_id from owner)
    and tags @> '["aerobic"]'::jsonb
    and objective_id is not null
  limit 1
)
-- 1) Upsert works
insert into works (
  id,
  owner_id,
  owner_email,
  visibility,
  name,
  subtitle,
  objective_id,
  parent_work_id,
  description_markdown,
  estimated_minutes,
  notes,
  video_urls,
  node_type,
  tags,
  created_at,
  updated_at,
  schedule_kind,
  schedule_number
)
select * from (
  values
    (
      'run-tempo',
      (select owner_id from owner),
      (select owner_email from owner),
      'private',
      'RUN · TEMPO',
      'Aerobic — quality',
      (select objective_id from objective),
      null,
      'Tempo run session.\n\nSuggested structure:\n- Warm-up\n- Tempo block(s)\n- Cool-down',
      45,
      null,
      '[]'::jsonb,
      'work',
      '["aerobic","running","tempo"]'::jsonb,
      now(),
      now(),
      null::text,
      null::int
    ),
    (
      'run-umbral',
      (select owner_id from owner),
      (select owner_email from owner),
      'private',
      'RUN · UMBRAL',
      'Aerobic — quality',
      (select objective_id from objective),
      null,
      'Threshold (umbral) run session.\n\nSuggested structure:\n- Warm-up\n- Threshold block(s)\n- Cool-down',
      45,
      null,
      '[]'::jsonb,
      'work',
      '["aerobic","running","umbral"]'::jsonb,
      now(),
      now(),
      null::text,
      null::int
    ),
    (
      'run-easy',
      (select owner_id from owner),
      (select owner_email from owner),
      'private',
      'RUN · EASY',
      'Aerobic — easy',
      (select objective_id from objective),
      null,
      'Easy run session.\n\nSuggested structure:\n- Easy continuous run\n- Optional strides\n- Cool-down',
      35,
      null,
      '[]'::jsonb,
      'work',
      '["aerobic","running","easy"]'::jsonb,
      now(),
      now(),
      null::text,
      null::int
    ),
    (
      'run-long-run',
      (select owner_id from owner),
      (select owner_email from owner),
      'private',
      'RUN · LONG RUN',
      'Aerobic — long',
      (select objective_id from objective),
      null,
      'Long run session.\n\nSuggested structure:\n- Easy long run\n- Optional progression\n- Cool-down',
      75,
      null,
      '[]'::jsonb,
      'work',
      '["aerobic","running","long-run"]'::jsonb,
      now(),
      now(),
      null::text,
      null::int
    )
) as v (
  id,
  owner_id,
  owner_email,
  visibility,
  name,
  subtitle,
  objective_id,
  parent_work_id,
  description_markdown,
  estimated_minutes,
  notes,
  video_urls,
  node_type,
  tags,
  created_at,
  updated_at,
  schedule_kind,
  schedule_number
)
on conflict (id) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  objective_id = excluded.objective_id,
  description_markdown = excluded.description_markdown,
  estimated_minutes = excluded.estimated_minutes,
  node_type = excluded.node_type,
  tags = excluded.tags,
  video_urls = excluded.video_urls,
  updated_at = now();

-- 2) Update personal plan groups (planner_states JSON)
with params as (
  select '6c3b5aa5-ee38-48ec-8c48-14e368a69f53'::uuid as user_id
),
group_defs as (
  select
    jsonb_build_object(
      'id','running_quality',
      'name','Running 🏃 · TEMPO/UMBRAL',
      'type','work',
      'order', 10,
      'enabled', true,
      'daysOfWeek', jsonb_build_array(3),
      'limitMode','count',
      'maxItems', 1,
      'strategy','weighted',
      'hierarchyRule','allow_all',
      'include', jsonb_build_array(
        jsonb_build_object('byNodeTypes', jsonb_build_array('work'), 'byTags', jsonb_build_array('aerobic','tempo')),
        jsonb_build_object('byNodeTypes', jsonb_build_array('work'), 'byTags', jsonb_build_array('aerobic','umbral'))
      ),
      'exclude', '[]'::jsonb
    ) as g_quality,
    jsonb_build_object(
      'id','running_easy',
      'name','Running 🏃 · EASY',
      'type','work',
      'order', 11,
      'enabled', true,
      'daysOfWeek', jsonb_build_array(5),
      'limitMode','count',
      'maxItems', 1,
      'strategy','overdue',
      'hierarchyRule','allow_all',
      'include', jsonb_build_array(
        jsonb_build_object('byNodeTypes', jsonb_build_array('work'), 'byTags', jsonb_build_array('aerobic','easy'))
      ),
      'exclude', '[]'::jsonb
    ) as g_easy,
    jsonb_build_object(
      'id','running_long',
      'name','Running 🏃 · LONG RUN',
      'type','work',
      'order', 12,
      'enabled', true,
      'daysOfWeek', jsonb_build_array(0),
      'limitMode','count',
      'maxItems', 1,
      'strategy','overdue',
      'hierarchyRule','allow_all',
      'include', jsonb_build_array(
        jsonb_build_object('byNodeTypes', jsonb_build_array('work'), 'byTags', jsonb_build_array('aerobic','long-run'))
      ),
      'exclude', '[]'::jsonb
    ) as g_long
),
plan_rewrite as (
  select
    jsonb_agg(
      case
        when plan->>'id' = 'personal-kungfu' then
          jsonb_set(
            plan,
            '{todayPlan,groups}',
            (
              -- Existing groups, with legacy "Running 🏃" disabled/renamed, and any previous new groups removed.
              coalesce(
                (
                  select jsonb_agg(
                    case
                      when (grp->>'name') in ('Running 🏃','Running 🏃 (legacy)') then
                        jsonb_set(
                          jsonb_set(grp, '{enabled}', 'false'::jsonb, true),
                          '{name}',
                          '\"Running 🏃 (legacy)\"'::jsonb,
                          true
                        )
                      else grp
                    end
                  )
                  from jsonb_array_elements(plan->'todayPlan'->'groups') as grp
                  where coalesce(grp->>'id', '') not in ('running_quality','running_easy','running_long')
                ),
                '[]'::jsonb
              )
              ||
              jsonb_build_array(
                (select g_quality from group_defs),
                (select g_easy from group_defs),
                (select g_long from group_defs)
              )
            ),
            true
          )
        else plan
      end
    ) as plans_json
  from planner_states ps
  cross join params
  cross join lateral jsonb_array_elements(ps.data->'plans') as plan
  where ps.user_id = params.user_id
)
update planner_states ps
set
  data = jsonb_set(ps.data, '{plans}', (select plans_json from plan_rewrite), true),
  updated_at = now()
where ps.user_id = (select user_id from params);

commit;
