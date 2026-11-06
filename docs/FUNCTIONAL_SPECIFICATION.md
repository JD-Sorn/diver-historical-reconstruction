# DIVER: Functional and Design Specification
*Reconstructed from the surviving 1978/79 program listing and associated system evidence.*

---

## Purpose
This document isolates the functional requirements, interface specifications, and architectural abstractions embodied in the surviving DIVER simulation. It serves to separate the high-level design specifications from their execution syntax in BASIC, while establishing an evidential mapping for attribution.

## 1. Functional Requirements

* **F-01 (Dive Progression):** The system shall explicitly model descent, work at depth, ascent, decompression, and rest as discrete procedural activities.
* **F-02 (Decompression Status):** The system shall compute and indicate whether the profile remains inside the 'no-stop' threshold or mandates an active decompression ceiling.
* **F-03 (Advance Warning):** During a active WORK activity, the system shall provide visual warnings of an impending, discrete increase in decompression stop duration before the penalty takes effect.
* **F-04 (Decision-Specific Information):** Information elements displayed on the monitor must isolate the immediate situational consequences for the operator, avoiding raw table interpretation.
* **F-05 (Dive Completion & MEMORY):** Upon dive completion, the live monitoring stream must be replaced by a fixed post-dive statistical summary using the same structural screen cells.
* **F-06 (User Activity Control):** The interface shall permit the operator to actively override the scheduler’s suggested activity sequence by queuing an alternative selection at the next activity boundary.
* **F-07 (Early WORK Termination):** The system shall allow an active WORK cycle to be truncated immediately by the user, forcing the scheduler to route directly toward ASCEND.

## 2. Design Concepts (DC)

* **DC-01 (Decision-Oriented Design):** The interface prioritizes status interpretation over raw data collection, selecting specific variables matching the user's immediate operational choices.
* **DC-02 (Impending Penalty Alerts):** Anticipatory warnings expose table transitions early, giving the user an option to flee the current depth before passing a table boundary.
* **DC-03 (Current/Forthcoming Conjunction):** The `Tx>y` syntax communicates two concurrent temporal dimensions: the current escape penalty and the looming penalty change.
* **DC-04 (Progressive Chromatic Mapping):** The chronological painting of fixed color bands under the graph converts an abstract numerical table matrix into an easily scannable geometric staircase.

## 3. Computational Design & Logical Architecture

### 3.1 Activity Scheduling Model
The scheduler maintains a dual-register layout consisting of an active current execution slot and a queued target register. Prompts for future choices are dispatched asynchronously; user choices are latched into memory and executed only upon crossing a rigid activity boundary.

### 3.2 Decompression Table Model
To handle continuous bottom-time accumulation against a stepped table matrix, long WORK blocks are internally fragmented into synchronized iterations corresponding to the underlying table columns. Each transition point re-evaluates the array boundaries and updates the display states.

### 3.3 Screen State Model
The system treats screen memory as a persistent, un-cleared buffer rather than redrawing frames globally. Individual display subroutines are locally responsible for overwriting designated cell blocks; historical artifacts remain on screen until a separate visual routine directly updates those exact coordinates.

## 4. Evidence, Attribution, and Layer Matrix

| Component ID | Element Specification | Program Evidence | Historical/Contextual Evidence | Project Attribution |
| :--- | :--- | :--- | :--- | :--- |
| **DC-02** | Advance Decompression Alerts | Observable in BASIC loop checking table thresholds. | Coincides with Aksnes' design notes regarding diver escape options. | Attributed to D. Aksnes (Design Concept). |
| **DC-03** | `Tx>y` Conjunction Text | Observable via flashing screen routines. | Described by Aksnes as a human-centered decision aid. | Attributed to D. Aksnes. |
| **HMI-02** | Fixed Dive Monitor Layout | Fixed row/cell mapping in `PLOT` commands. | CRT screen photographs dated 1979. | Collaboration Baseline. |
| **F-01** | Multi-Activity State Engine | Clear conditional branching architecture in BASIC source. | Standard system engineering documentation structure. | Attributed to Dr. G. Mallen (Implementation). |

### 4.1 Contribution Hierarchy
* **Layer A (Design Concept):** Informing a human diver of structural changes before they manifest. (Originated by Dagfinn Aksnes).
* **Layer B (Computational Design):** Calculating table boundary limits mathematically and isolating the transition window. (Collaborative).
* **Layer C (Program Implementation):** Forcing characters to flash or ripple using Intecolor-specific `PLOT` escape configurations. (Executed by Dr. George Mallen).
