const normalizeSprintText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const MAX_SELECTABLE_SPRINT_ID = 4;

export const isExcludedSprintLabel = (value) => {
  const normalized = normalizeSprintText(value);
  return normalized === "sprint5" || normalized === "sprint6";
};

export const isSelectableSprint = (sprint) => {
  const sprintId = Number(sprint?.idSprint ?? sprint?.id);
  if (Number.isFinite(sprintId) && sprintId > MAX_SELECTABLE_SPRINT_ID) {
    return false;
  }

  return !isExcludedSprintLabel(
    sprint?.nombre ?? sprint?.name ?? sprint?.label ?? sprint?.sprint,
  );
};

export const filterSelectableSprints = (sprints) =>
  Array.isArray(sprints) ? sprints.filter(isSelectableSprint) : [];

export const getSelectableSprintId = (sprints, currentId = null) => {
  const currentSprintId = Number(currentId);

  if (
    Number.isFinite(currentSprintId) &&
    sprints.some((sprint) => Number(sprint?.idSprint ?? sprint?.id) === currentSprintId)
  ) {
    return currentId;
  }

  const fallbackSprint = sprints[0];
  return fallbackSprint?.idSprint ?? fallbackSprint?.id ?? null;
};