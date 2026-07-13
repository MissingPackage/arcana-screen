# ArcanaScreen recovery specification — product model

Status: recovery baseline, 13 July 2026

## Product promise

ArcanaScreen is the Dungeon Master's live operational surface. It keeps prepared information, live capture and the current session action in one glanceable workspace. It is not a campaign database, VTT or general-purpose document editor.

## Domain objects

### Screen

A Screen is the durable workspace selected from the header. It owns:

- name and template origin;
- Prepare/Run mode;
- current Focus;
- Session Notebook content;
- Quick Capture inbox;
- pinned Quick References;
- universal Dice and Timer state;
- contextual state for Narrative, Social, Exploration and Combat;
- timestamps and schema version.

Switching Focus MUST NOT create another Screen or replace universal content.

### Mode

`Prepare` and `Run` are the only application modes.

- Prepare exposes structure, configuration, library and destructive layout actions.
- Run protects structure and foregrounds the current live task.
- Switching mode preserves content, Focus, scroll position and contextual state.

### Focus

Focus is temporary session context: `narrative`, `social`, `exploration` or `combat`. A General Screen may start with no Focus selected.

- Focus changes hierarchy and contextual tools.
- Focus never owns notebook, capture, pinned references, Dice or Timer.
- Leaving a Focus preserves its state; returning restores it.
- Focus is not a template, route, Screen or global application mode.

## State invariants

1. At most one Screen is active.
2. Every persisted Screen has a supported schema version.
3. Universal state is identical before and after a Focus transition.
4. A contextual state update affects only its owning Focus.
5. Run exposes no layout add/remove/reorder/resize actions.
6. Every destructive action has confirmation or undo.
7. Reload reconstructs the active Screen, mode, Focus and tool state without network access.
8. Invalid persisted data falls back to a recoverable state and never silently overwrites a valid snapshot.

## Acceptance examples

### Focus continuity

Given a Screen with notebook text, one capture and state in all four Focuses  
When the DM changes Social → Exploration → Combat → Narrative → Social  
Then notebook, capture and references are unchanged  
And each Focus restores its previous contextual state.

### Protected Run

Given a Screen in Prepare  
When the DM enters Run  
Then layout controls disappear  
And live tool controls remain available  
And returning to Prepare restores structural controls without changing live state.

### Reload recovery

Given an active Screen in Run with Exploration Focus and an active timestamp-based timer  
When the page reloads  
Then the same Screen, mode and Focus reopen  
And the timer reflects elapsed wall-clock time  
And no remote request is required.
