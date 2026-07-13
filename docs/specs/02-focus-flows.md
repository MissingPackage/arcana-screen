# Focus functional specification

## Shared Focus selector

The selector identifies Focus separately from Screen and Prepare/Run. It offers Narrative, Social, Exploration and Combat. The active choice has text, icon and selected treatment.

Given the Screen is in Run  
When the DM selects another Focus  
Then the central hierarchy changes immediately  
And notebook, captures, references, Dice and Timer retain state  
And the previous Focus state remains restorable.

## Narrative Focus

Source: `focus-narrative.png`

### Required surfaces

- Session Notebook hero with active scene.
- Internal outline: Scene setup, Characters, Beats, Reveals, Aftermath.
- Prepared scene sections and checkable story beats.
- Margin notes with pinned snippets, recent capture and source link.
- Context drawer containing current beat, open threads and pacing.
- Primary action: Move to next beat.

### Required interactions

- Select an outline section.
- Complete/uncomplete a beat.
- Advance the current beat.
- Advance the four-stage pacing clock.
- Collapse/reopen Narrative Focus context.
- Capture text without losing notebook position.

### Acceptance

Given beat 2 is current and beat 1 is completed  
When Move to next beat is activated  
Then beat 2 becomes completed  
And beat 3 becomes current  
And the notebook and universal state are unchanged.

## Social Focus

Source: `focus-social.png`

### Required surfaces

- Session Notebook hero with current scene, player knowledge, scene beats and open threads.
- NPC list with name, role, visible attitude, motive and secret cue.
- Pinned Reference.
- Eight-segment Scene Clock.
- Recent Capture line.

### Required interactions

- Edit current scene title and notebook sections.
- Select an NPC and update attitude.
- Advance/reset the Scene Clock with confirmation for reset.
- Open the pinned reference link.
- Capture text and promote it into the notebook.

### Acceptance

Given the Social clock has three filled segments  
When the DM advances the clock  
Then four segments are filled and the value persists  
And no Narrative, Exploration or Combat state changes.

## Exploration Focus

Source: `focus-exploration.png`

### Required surfaces

- Session Flow rail with previous, current and prepared next moments.
- Session Ledger hero with read-aloud text, clues, changes and chronological live log.
- Exploration context with location cues, five-segment Discovery Clock and pinned reference.
- Universal Quick Capture.
- Compact Counter in the utility dock in addition to Dice and Timer.

### Required interactions

- Add, select and complete a session moment.
- Add a clue and a chronological log entry.
- Advance/reset Discovery Clock.
- Increment/decrement/reset Counter.
- Change Focus without losing the active moment.

### Acceptance

Given Echoing Galleries is active and The Sunken Archive is prepared  
When Echoing Galleries is completed  
Then it becomes completed  
And The Sunken Archive becomes the active moment  
And the previous moment remains in Session Flow.

## Combat Focus

Source: `selected-run-target.png`

### Required surfaces

- Initiative hero occupying roughly two-thirds of desktop Run.
- Round and current/next combatant.
- Scan-friendly rows with initiative, combatant identity, HP and conditions.
- Context column with Quick Capture, conditions, cover, encounter notes and source link.
- Primary Next Turn action.
- Dice and Timer in bottom dock.

### Required interactions

- Add/edit/reorder/remove combatants in Prepare, not the default Run viewport.
- In Run: adjust HP/temp HP/conditions through compact live controls or an on-demand detail, never a full setup form.
- Advance turn and round.
- Reset encounter with confirmation and undo.
- Preserve encounter state when leaving and returning to Combat.

### Acceptance

Given the last combatant is active in round 3  
When Next Turn is activated  
Then the first combatant becomes active  
And round becomes 4  
And the change is announced to assistive technology.

## General note-first state

A General Screen with no selected Focus foregrounds Session Notebook, Quick Capture and Quick Reference using the shared design language. It offers the Focus selector but does not invent a contextual entity model.
