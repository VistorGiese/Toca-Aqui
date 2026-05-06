---
phase: 01-foundation
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - TocaAqui/screens/artist/ContractDetail.tsx
  - TocaAqui/screens/artist/MyApplications.tsx
autonomous: true
requirements:
  - REQ-03

must_haves:
  truths:
    - "ContractDetail.tsx uses ArtistStackParamList for navigation typing — not RootStackParamList"
    - "MyApplications.tsx uses ArtistStackParamList for navigation typing — not RootStackParamList"
    - "Navigating from BrowseEvents to ApplyConfirmation to MyApplications to ContractDetail produces no TypeScript type errors"
  artifacts:
    - path: "TocaAqui/screens/artist/ContractDetail.tsx"
      provides: "Contract detail screen with correct navigation types"
      contains: "ArtistStackParamList"
    - path: "TocaAqui/screens/artist/MyApplications.tsx"
      provides: "My applications screen with correct navigation types"
      contains: "ArtistStackParamList"
  key_links:
    - from: "TocaAqui/screens/artist/ContractDetail.tsx"
      to: "TocaAqui/navigation/ArtistNavigator.tsx"
      via: "import { ArtistStackParamList }"
      pattern: "ArtistStackParamList"
    - from: "TocaAqui/screens/artist/MyApplications.tsx"
      to: "TocaAqui/navigation/ArtistNavigator.tsx"
      via: "import { ArtistStackParamList }"
      pattern: "ArtistStackParamList"
---

<objective>
Fix navigation type imports in ContractDetail.tsx and MyApplications.tsx to use ArtistStackParamList instead of RootStackParamList.

Purpose: Ensures the artist flow navigation chain has correct types, preventing hidden bugs when adding navigation in future phases (REQ-03).
Output: Both screens use the correct navigator type for the artist stack.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation/01-CONTEXT.md

<interfaces>
<!-- ArtistStackParamList is exported from ArtistNavigator.tsx -->

From TocaAqui/navigation/ArtistNavigator.tsx:
```typescript
export type ArtistStackParamList = {
  ArtistTabs: undefined;
  EventDetailArtist: { eventId: number };
  ApplyConfirmation: {
    eventId: number;
    eventName: string;
    date: string;
    time: string;
    cache: string;
  };
  ShowDetail: { contractId: number };
  ContractDetail: { contractId: number };
  RateEstablishment: { contractId: number; venueName: string };
  Subscription: undefined;
};
```

Current problems:
- ContractDetail.tsx line 15: `import { RootStackParamList } from "@/navigation/Navigate";`
- MyApplications.tsx line 16: `import { RootStackParamList } from "@/navigation/Navigate";`
Both should import ArtistStackParamList from ArtistNavigator instead.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix ContractDetail.tsx navigation type import</name>
  <files>TocaAqui/screens/artist/ContractDetail.tsx</files>
  <read_first>
    - TocaAqui/screens/artist/ContractDetail.tsx (current state — line 15 imports RootStackParamList from Navigate)
    - TocaAqui/navigation/ArtistNavigator.tsx (source of truth — exports ArtistStackParamList with ContractDetail: { contractId: number })
  </read_first>
  <action>
    Edit `TocaAqui/screens/artist/ContractDetail.tsx`:

    1. **Replace the import on line 15:**
       Change:
       ```typescript
       import { RootStackParamList } from "@/navigation/Navigate";
       ```
       To:
       ```typescript
       import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
       ```

    2. **Find and replace all usages of `RootStackParamList` in this file** with `ArtistStackParamList`. Common patterns to find:
       - `NativeStackNavigationProp<RootStackParamList>` → `NativeStackNavigationProp<ArtistStackParamList>`
       - `NativeStackNavigationProp<RootStackParamList, "ContractDetail">` → `NativeStackNavigationProp<ArtistStackParamList, "ContractDetail">`
       - `RouteProp<RootStackParamList, "ContractDetail">` → `RouteProp<ArtistStackParamList, "ContractDetail">`

    3. **Do NOT remove `RootStackParamList` from Navigate.tsx** — other screens may still reference it (per CONTEXT.md decision 3).
  </action>
  <verify>
    <automated>cd "C:/Users/vitor/Documents/Dev/TCC - Toca Aqui/Toca-Aqui" && grep -n "RootStackParamList" TocaAqui/screens/artist/ContractDetail.tsx; echo "---"; grep -n "ArtistStackParamList" TocaAqui/screens/artist/ContractDetail.tsx</automated>
  </verify>
  <acceptance_criteria>
    - ContractDetail.tsx does NOT contain `RootStackParamList` anywhere
    - ContractDetail.tsx contains `import { ArtistStackParamList } from "@/navigation/ArtistNavigator"`
    - ContractDetail.tsx contains `ArtistStackParamList` in navigation prop type(s)
    - ContractDetail.tsx does NOT contain `import.*Navigate` (the old Navigate import is fully removed)
  </acceptance_criteria>
  <done>ContractDetail.tsx uses ArtistStackParamList from ArtistNavigator.tsx for all navigation typing.</done>
</task>

<task type="auto">
  <name>Task 2: Fix MyApplications.tsx navigation type import</name>
  <files>TocaAqui/screens/artist/MyApplications.tsx</files>
  <read_first>
    - TocaAqui/screens/artist/MyApplications.tsx (current state — line 16 imports RootStackParamList from Navigate)
    - TocaAqui/navigation/ArtistNavigator.tsx (source of truth — exports ArtistStackParamList)
  </read_first>
  <action>
    Edit `TocaAqui/screens/artist/MyApplications.tsx`:

    1. **Replace the import on line 16:**
       Change:
       ```typescript
       import { RootStackParamList } from "@/navigation/Navigate";
       ```
       To:
       ```typescript
       import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
       ```

    2. **Find and replace all usages of `RootStackParamList` in this file** with `ArtistStackParamList`. Common patterns:
       - `NativeStackNavigationProp<RootStackParamList>` → `NativeStackNavigationProp<ArtistStackParamList>`
       - `NativeStackNavigationProp<RootStackParamList, "MyApplications">` → `NativeStackNavigationProp<ArtistStackParamList>`
       - Any `RouteProp<RootStackParamList, ...>` → `RouteProp<ArtistStackParamList, ...>`

    3. **Do NOT remove `RootStackParamList` from Navigate.tsx** — other screens may still reference it.
  </action>
  <verify>
    <automated>cd "C:/Users/vitor/Documents/Dev/TCC - Toca Aqui/Toca-Aqui" && grep -n "RootStackParamList" TocaAqui/screens/artist/MyApplications.tsx; echo "---"; grep -n "ArtistStackParamList" TocaAqui/screens/artist/MyApplications.tsx</automated>
  </verify>
  <acceptance_criteria>
    - MyApplications.tsx does NOT contain `RootStackParamList` anywhere
    - MyApplications.tsx contains `import { ArtistStackParamList } from "@/navigation/ArtistNavigator"`
    - MyApplications.tsx contains `ArtistStackParamList` in navigation prop type(s)
    - MyApplications.tsx does NOT contain `import.*Navigate` (the old Navigate import is fully removed)
  </acceptance_criteria>
  <done>MyApplications.tsx uses ArtistStackParamList from ArtistNavigator.tsx for all navigation typing.</done>
</task>

</tasks>

<verification>
Run: `grep -rn "RootStackParamList" TocaAqui/screens/artist/ContractDetail.tsx TocaAqui/screens/artist/MyApplications.tsx`
Expected: No output (no RootStackParamList references in either file)

Run: `grep -rn "ArtistStackParamList" TocaAqui/screens/artist/ContractDetail.tsx TocaAqui/screens/artist/MyApplications.tsx`
Expected: Import line + usage in navigation type for both files
</verification>

<success_criteria>
- Both ContractDetail.tsx and MyApplications.tsx import ArtistStackParamList from ArtistNavigator
- Neither file references RootStackParamList
- Navigation type chain is correct for the artist flow
- REQ-03 satisfied: navigation between screens in the main flow works without parameter errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-03-SUMMARY.md`
</output>
