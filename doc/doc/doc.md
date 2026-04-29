# Introduction
This is a research project that aims to integrate automated UML assessment into Meitrex. The system will incorporate Hylimo to enable the creation and submission of UML assignments. Student solutions will then be automatically evaluated based on reference solutions provided by tutors.

**What is HyLiMo?** Hylimo is a hybrid diagramming tool that enables users to create and edit diagrams, such as UML diagrams, by using a combination of textual code (a domain-specific language) and a graphical editor. Changes made to either the code or the visual representation are automatically synchronised, ensuring both views always remain consistent.
This paper consists of:
- *Requirements*
- Architecture and Decisions
- HyLiMo Integration
- Automated UML Assessment
- Evaluation
- Functionalities (Developres + Lecturer Guide)
- Future Work

# Requirements
Based on the objectives of this research project, the following section defines the high-level requirements for integrating automated UML assessment into Meitrex using HyLiMo.


- Creating a UML assessment (Task and Solution)
- Working on a UML assessment
- Saving a UML assessment solution
- Submitting a UML assessment
- Redoing a UML assessment (if possible)
- Evaluate a UML diagram
- View Submitted UML Assessment
- Lecturer Views and Manages Student Submissions

For Use Cases checkout: https://docs.google.com/document/d/1zKl2Vpk7k4WUOQumee5xeIibMjcerCa-Pp7XphvoagM/edit?tab=t.0


# Architecture and Decisions

## Systemarchitecture
Show MEITREX + HyLiMo System Context --> Component Diagrams



## Domain Model
The diagram shows the domain model for the UML assignment. An UmlExercise is the task created by the tutor. For each exercise, a student has a UmlStudentSubmission, which contains all their attempts. Each submission can include multiple solutions (UmlStudentSolution). Every solution contains a UML diagram and can receive feedback with points and comments.

![Domain Model](img/class_diagram.png)


## HyLiMo Integration
One of the main tasks was the integration of HyLiMo into MEITREX. First, all required components had to be identified. The needed HyLiMo code was originally built using Vite. This code served as the basis for the migration into our Next.js (React) project. As part of this process, the application had to be adapted and converted from the Vite setup to the Next.js architecture.
- TBD: HyLiMo Architektur Diagram


## Automated UML Assessment
The second major task was the automatic evaluation of UML diagrams based on the tutor’s solution.

The sequence diagram illustrates, in a simplified manner, how a student’s UML solution is processed and evaluated across the system. First, the student creates and submits a UML diagram in the frontend, which then transforms the diagram code into a structured semantic model. This model is sent to the backend, where the UmlEvaluationService delegates the evaluation. The backend interacts with a large language model (LLM) in two steps: it first performs an analysis by comparing the student’s semantic model with the tutor’s reference model, and then conducts a grading step that generates points and textual feedback based on the analysis results. Finally, the computed feedback is returned through the backend to the frontend and presented to the student


![Sequence Diagram of the Evaluation](img/sequence_eval.png)

### Semantic Model (Sequence Diagram) ???
TBD

### Prompt Engineering
TBD

# Evaluation
## Goals
The goal of this evaluation is to assess how accurately the automated UML assessment system can replicate human grading. In particular, we investigate whether the system can produce scores comparable to lecturer evaluations and how different large language models influence the assessment quality.
## Setup
For the evaluation, we used the UML diagrams that students had submitted in previous lecture assignments. These were originally graded by by human lecturers.


To enable automated processing, the student models were converted into Hylimo code. We used tutor-provided submissions that achieved full marks as reference solutions, representing correct and complete UML models.


## Methodology
An evaluation script was developed to automatically assess the converted UML models against the reference tutor solutions. In addition, multiple large language models were tested to compare their performance in grading UML diagrams. Each submission was evaluated five times to account for variance in the grading results.


## Metrics
The evaluation is based on the following metrics:
Agreement between automated scores and lecturer grades
Performance differences between the tested LLMs
...
## Result
TBD


# Functionalities
## User Guide for Lecturer
### Introduction
Tutors can create and provide model solutions for UML assignments within Hylimo. Student submissions are then automatically evaluated against the tutor solution.
For more information about HyLiMo check out: https://hylimo.github.io/docs/docs.html


#### Functionalities
#### Create UML assignment
UML assignments can be created in the same way as other assignments

![Create Uml Assignment](img/create_uml_assignment.png)

When selecting 'UML Assignment', a pop-up window opens where the assignment can be created.

![Pop-Up Create Uml Assignment Metadata](img/create_uml_assignment_metadata.png)

In the pop-up window, similar to other assignments, the metadata can be filled in. Below that, the UML-specific fields are available.

![Pop-Up Create Uml Assignment Uml Data](img/create_uml_assignment_uml_data.png)

The UML Assignment creator includes a rich text editor where the task description can be written. In addition, grading criteria can be defined to support the LLM-based evaluation of the diagram.
In the settings, you can set the total number of points and the passing threshold, as well as choose whether the model solution should be displayed. The tutor can also provide a HyLiMo reference solution, which is then used as the basis for the LLM’s evaluation.

#### Modify UML assignment
#### UML Assignment Overview


## User Guide for Student
### Introduction
For UML assignments, students complete tasks within Hylimo by creating their own UML models. Their submissions are automatically evaluated, allowing them to receive feedback.
For more information about HyLiMo check out: https://hylimo.github.io/docs/docs.html


#### Functionalities
#### Work on UML Assessment
