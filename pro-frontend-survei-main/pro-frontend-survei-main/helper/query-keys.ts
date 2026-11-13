export const surveyKeys = {
  all: ['surveys'] as const,
  lists: () => [...surveyKeys.all, 'list'] as const,
  list: (filters: object) => [...surveyKeys.lists(), { filters }] as const,
  details: () => [...surveyKeys.all, 'detail'] as const,
  detail: (id: string) => [...surveyKeys.details(), id] as const,
  instruments: (surveyId: string) => [...surveyKeys.detail(surveyId), 'instruments'] as const,
  assignedInstitutions: (publicLink: string) => [...surveyKeys.all, 'assigned-institutions', publicLink] as const,
};

export const userKeys = {
  all: ['users'] as const,
  hierarchy: (params: object) => [...userKeys.all, 'hierarchy', params] as const,
};

