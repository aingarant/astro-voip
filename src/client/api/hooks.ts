import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteJson, getJson, patchJson, postJson, putJson } from './client';
import { queryKeys } from './query-keys';
import type { ListResponse, PaginationParams, TenantScope } from './types';

type ListConfig<TItem, TKey extends string> = {
  path: string;
  listKey: TKey;
  queryKey: readonly unknown[];
  query?: Record<string, string | number | boolean | null | undefined>;
};

type CrudConfig = {
  path: string;
  queryKey: readonly unknown[];
  query?: Record<string, string | number | boolean | null | undefined>;
};

export const useListQuery = <TItem, TKey extends string>(config: ListConfig<TItem, TKey>) =>
  useQuery({
    queryKey: [...config.queryKey, config.query] as const,
    queryFn: () => getJson<ListResponse<TItem, TKey>>(config.path, config.query),
  });

export const useCreateMutation = <TPayload>(config: CrudConfig) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TPayload) => postJson(config.path, payload, config.query),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  });
};

export const useUpdateMutation = <TPayload extends { id: number | string }>(config: CrudConfig) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: TPayload) =>
      putJson(`${config.path}/${id}`, payload, config.query),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  });
};

export const usePatchMutation = <TPayload extends { id: number | string; body: unknown }>(
  config: CrudConfig,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: TPayload) => patchJson(`${config.path}/${id}`, body, config.query),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  });
};

export const useDeleteMutation = (config: CrudConfig) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteJson(`${config.path}/${id}`, config.query),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  });
};

// Core manager routes
export const useAccounts = () =>
  useListQuery({ path: '/accounts', listKey: 'accounts', queryKey: queryKeys.accounts });
export const useCreateAccount = <TPayload>() =>
  useCreateMutation<TPayload>({ path: '/accounts', queryKey: queryKeys.accounts });
export const useUpdateAccount = <TPayload extends { id: number | string }>() =>
  useUpdateMutation<TPayload>({ path: '/accounts', queryKey: queryKeys.accounts });

export const useSubscribers = () =>
  useListQuery({ path: '/subscribers', listKey: 'subscribers', queryKey: queryKeys.subscribers });
export const useCreateSubscriber = <TPayload>() =>
  useCreateMutation<TPayload>({ path: '/subscribers', queryKey: queryKeys.subscribers });
export const useUpdateSubscriber = <TPayload extends { id: number | string }>() =>
  useUpdateMutation<TPayload>({ path: '/subscribers', queryKey: queryKeys.subscribers });

export const useDids = (query?: PaginationParams & { accountId?: number; domain?: string }) =>
  useListQuery({ path: '/dids', listKey: 'dids', queryKey: queryKeys.dids, query });
export const useCreateDid = <TPayload>() => useCreateMutation<TPayload>({ path: '/dids', queryKey: queryKeys.dids });
export const useUpdateDid = <TPayload extends { id: number | string }>() =>
  useUpdateMutation<TPayload>({ path: '/dids', queryKey: queryKeys.dids });

export const useExtensions = () =>
  useListQuery({ path: '/extensions', listKey: 'extensions', queryKey: queryKeys.extensions });
export const useCreateExtension = <TPayload>() =>
  useCreateMutation<TPayload>({ path: '/extensions', queryKey: queryKeys.extensions });
export const useUpdateExtension = <TPayload extends { id: number | string }>() =>
  useUpdateMutation<TPayload>({ path: '/extensions', queryKey: queryKeys.extensions });

export const useVoicemailBoxes = () =>
  useListQuery({ path: '/voicemail-boxes', listKey: 'voicemailBoxes', queryKey: queryKeys.voicemailBoxes });
export const useUpdateVoicemailBox = <TPayload extends { id: number | string }>() =>
  useUpdateMutation<TPayload>({ path: '/voicemail-boxes', queryKey: queryKeys.voicemailBoxes });
export const useVoicemailMessages = (query?: { voicemailBoxId?: number } & PaginationParams) =>
  useListQuery({
    path: '/voicemail-messages',
    listKey: 'voicemailMessages',
    queryKey: queryKeys.voicemailMessages,
    query,
  });

export const useIvrProfiles = (scope: TenantScope & PaginationParams) =>
  useListQuery({ path: '/ivr', listKey: 'ivrProfiles', queryKey: queryKeys.ivr, query: scope });
export const useCreateIvrProfile = <TPayload>(scope: TenantScope) =>
  useCreateMutation<TPayload>({ path: '/ivr', queryKey: queryKeys.ivr, query: scope });
export const useUpdateIvrProfile = <TPayload extends { id: number | string }>(scope: TenantScope) =>
  useUpdateMutation<TPayload>({ path: '/ivr', queryKey: queryKeys.ivr, query: scope });

export const useInboundRoutes = (scope: TenantScope & PaginationParams) =>
  useListQuery({
    path: '/inbound-routes',
    listKey: 'inboundRoutes',
    queryKey: queryKeys.inboundRoutes,
    query: scope,
  });
export const useCreateInboundRoute = <TPayload>(scope: TenantScope) =>
  useCreateMutation<TPayload>({ path: '/inbound-routes', queryKey: queryKeys.inboundRoutes, query: scope });
export const useUpdateInboundRoute = <TPayload extends { id: number | string }>(scope: TenantScope) =>
  useUpdateMutation<TPayload>({ path: '/inbound-routes', queryKey: queryKeys.inboundRoutes, query: scope });

// Remaining backend route groups (coverage hooks)
export const useTimeConditions = (scope: TenantScope & PaginationParams) =>
  useListQuery({
    path: '/time-conditions',
    listKey: 'timeConditions',
    queryKey: queryKeys.timeConditions,
    query: scope,
  });

export const useRoutingPolicies = (scope: TenantScope & PaginationParams) =>
  useListQuery({
    path: '/routing-policies',
    listKey: 'routingPolicies',
    queryKey: queryKeys.routingPolicies,
    query: scope,
  });

export const useRegistrations = (query?: PaginationParams & { activeOnly?: boolean }) =>
  useListQuery({
    path: '/registrations',
    listKey: 'registrations',
    queryKey: queryKeys.registrations,
    query,
  });

export const useDialogs = (query?: PaginationParams) =>
  useListQuery({ path: '/dialogs', listKey: 'dialogs', queryKey: queryKeys.dialogs, query });

export const useDispatcher = (query?: PaginationParams) =>
  useListQuery({ path: '/dispatcher', listKey: 'dispatcher', queryKey: queryKeys.dispatcher, query });

export const useDialplan = (query?: PaginationParams) =>
  useListQuery({ path: '/dialplan', listKey: 'dialplan', queryKey: queryKeys.dialplan, query });

export const useTrustedSources = (query?: PaginationParams) =>
  useListQuery({ path: '/trust/trusted', listKey: 'trusted', queryKey: queryKeys.trustTrusted, query });

export const useTrustedAddresses = (query?: PaginationParams) =>
  useListQuery({
    path: '/trust/addresses',
    listKey: 'addresses',
    queryKey: queryKeys.trustAddresses,
    query,
  });

export const useLcrGateways = (query?: PaginationParams) =>
  useListQuery({ path: '/lcr/gateways', listKey: 'gateways', queryKey: queryKeys.lcrGateways, query });

export const useLcrRules = (query?: PaginationParams) =>
  useListQuery({ path: '/lcr/rules', listKey: 'rules', queryKey: queryKeys.lcrRules, query });

export const useLcrRuleTargets = (query?: PaginationParams & { lcrRuleId?: number }) =>
  useListQuery({
    path: '/lcr/rule-targets',
    listKey: 'ruleTargets',
    queryKey: queryKeys.lcrRuleTargets,
    query,
  });

export const useReportCdrs = (query?: PaginationParams & { startDate?: string; endDate?: string }) =>
  useListQuery({ path: '/reports/cdrs', listKey: 'cdrs', queryKey: queryKeys.reportsCdrs, query });

export const useReportAcc = (query?: PaginationParams & { startDate?: string; endDate?: string }) =>
  useListQuery({ path: '/reports/acc', listKey: 'acc', queryKey: queryKeys.reportsAcc, query });

export const useReportMissedCalls = (query?: PaginationParams & { startDate?: string; endDate?: string }) =>
  useListQuery({
    path: '/reports/missed-calls',
    listKey: 'missedCalls',
    queryKey: queryKeys.reportsMissedCalls,
    query,
  });

export const useDomains = (query?: PaginationParams) =>
  useListQuery({ path: '/domains', listKey: 'domains', queryKey: queryKeys.domains, query });

export const useDbAliases = (query?: PaginationParams) =>
  useListQuery({ path: '/dbaliases', listKey: 'dbaliases', queryKey: queryKeys.dbaliases, query });

export const useVersionRows = () =>
  useListQuery({ path: '/version', listKey: 'version', queryKey: queryKeys.version });

export const useHealth = () =>
  useQuery({
    queryKey: queryKeys.health,
    queryFn: () => getJson<{ status: string; timestamp?: string }>('/health'),
  });

export const useReady = () =>
  useQuery({
    queryKey: queryKeys.ready,
    queryFn: () => getJson<{ status: string; error?: string }>('/ready'),
  });
