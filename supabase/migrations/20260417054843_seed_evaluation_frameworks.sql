/*
  # Seed Evaluation Frameworks with Standard Criteria

  ## Overview
  Seeds predefined frameworks (MEDDIC, BANT, RUBRIC, SPIN) with their standard criteria and scoring rules.

  ## Frameworks Added
  1. MEDDIC - Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion
  2. BANT - Budget, Authority, Need, Timeline
  3. RUBRIC - Custom scoring rubric with flexible categories
  4. SPIN - Situation, Problem, Implication, Need-payoff

  ## Scoring Levels
  - 1: Not Addressed
  - 2: Mentioned/Acknowledged
  - 3: Explored/Discussed
  - 4: Deep Dive/Mastered
  - 5: Exemplary/Outstanding
*/

-- Insert MEDDIC Framework
INSERT INTO evaluation_frameworks (name, description, framework_type, icon, is_active)
VALUES (
  'MEDDIC',
  'Sales qualification methodology focusing on Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, and Champion',
  'MEDDIC',
  'target',
  true
) ON CONFLICT (name) DO NOTHING;

-- Insert MEDDIC Criteria
WITH meddic_fw AS (SELECT id FROM evaluation_frameworks WHERE framework_type = 'MEDDIC' LIMIT 1)
INSERT INTO framework_criteria (framework_id, criterion_key, name, description, weight, display_order)
SELECT meddic_fw.id, criterion_key, name, description, weight, display_order
FROM (VALUES
  ('metrics', 'Metrics', 'Identified and discussed quantifiable business metrics', 1.0, 1),
  ('economic_buyer', 'Economic Buyer', 'Identified the person/people with budget authority', 1.2, 2),
  ('decision_criteria', 'Decision Criteria', 'Understood decision-making criteria and requirements', 1.0, 3),
  ('decision_process', 'Decision Process', 'Mapped the buying process and timeline', 1.0, 4),
  ('identify_pain', 'Identify Pain', 'Uncovered specific business problems and pain points', 1.1, 5),
  ('champion', 'Champion', 'Identified an internal advocate within the prospect org', 1.1, 6)
) AS t(criterion_key, name, description, weight, display_order), meddic_fw
WHERE NOT EXISTS (
  SELECT 1 FROM framework_criteria fc
  WHERE fc.framework_id = meddic_fw.id AND fc.criterion_key = t.criterion_key
);

-- Insert BANT Framework
INSERT INTO evaluation_frameworks (name, description, framework_type, icon, is_active)
VALUES (
  'BANT',
  'Sales qualification methodology focusing on Budget, Authority, Need, and Timeline',
  'BANT',
  'dollar-sign',
  true
) ON CONFLICT (name) DO NOTHING;

-- Insert BANT Criteria
WITH bant_fw AS (SELECT id FROM evaluation_frameworks WHERE framework_type = 'BANT' LIMIT 1)
INSERT INTO framework_criteria (framework_id, criterion_key, name, description, weight, display_order)
SELECT bant_fw.id, criterion_key, name, description, weight, display_order
FROM (VALUES
  ('budget', 'Budget', 'Budget allocated and approved for this initiative', 1.0, 1),
  ('authority', 'Authority', 'Decision maker identified with approval authority', 1.2, 2),
  ('need', 'Need', 'Business need or problem clearly established', 1.1, 3),
  ('timeline', 'Timeline', 'Implementation or purchase timeline identified', 1.0, 4)
) AS t(criterion_key, name, description, weight, display_order), bant_fw
WHERE NOT EXISTS (
  SELECT 1 FROM framework_criteria fc
  WHERE fc.framework_id = bant_fw.id AND fc.criterion_key = t.criterion_key
);

-- Insert SPIN Framework
INSERT INTO evaluation_frameworks (name, description, framework_type, icon, is_active)
VALUES (
  'SPIN Selling',
  'Sales methodology using Situation, Problem, Implication, and Need-payoff questioning',
  'SPIN',
  'help-circle',
  true
) ON CONFLICT (name) DO NOTHING;

-- Insert SPIN Criteria
WITH spin_fw AS (SELECT id FROM evaluation_frameworks WHERE framework_type = 'SPIN' LIMIT 1)
INSERT INTO framework_criteria (framework_id, criterion_key, name, description, weight, display_order)
SELECT spin_fw.id, criterion_key, name, description, weight, display_order
FROM (VALUES
  ('situation', 'Situation', 'Established background and current situation', 0.9, 1),
  ('problem', 'Problem', 'Identified problems and difficulties', 1.1, 2),
  ('implication', 'Implication', 'Explored consequences and implications of problems', 1.2, 3),
  ('need_payoff', 'Need-payoff', 'Built value through buyer-stated benefits', 1.2, 4)
) AS t(criterion_key, name, description, weight, display_order), spin_fw
WHERE NOT EXISTS (
  SELECT 1 FROM framework_criteria fc
  WHERE fc.framework_id = spin_fw.id AND fc.criterion_key = t.criterion_key
);

-- Insert RUBRIC Framework
INSERT INTO evaluation_frameworks (name, description, framework_type, icon, is_active)
VALUES (
  'Custom Rubric',
  'Flexible rubric scoring system with customizable categories and performance levels',
  'RUBRIC',
  'list-checks',
  true
) ON CONFLICT (name) DO NOTHING;

-- Insert RUBRIC Criteria (generic scoring criteria)
WITH rubric_fw AS (SELECT id FROM evaluation_frameworks WHERE framework_type = 'RUBRIC' LIMIT 1)
INSERT INTO framework_criteria (framework_id, criterion_key, name, description, weight, display_order)
SELECT rubric_fw.id, criterion_key, name, description, weight, display_order
FROM (VALUES
  ('communication', 'Communication Skills', 'Clarity, listening, and articulation', 1.0, 1),
  ('discovery', 'Discovery Process', 'Questioning, probing, and discovery depth', 1.1, 2),
  ('objection_handling', 'Objection Handling', 'Addressing concerns and overcoming objections', 1.0, 3),
  ('value_proposition', 'Value Proposition', 'Articulating benefits aligned with needs', 1.1, 4),
  ('next_steps', 'Next Steps', 'Clear closing and next steps', 0.9, 5)
) AS t(criterion_key, name, description, weight, display_order), rubric_fw
WHERE NOT EXISTS (
  SELECT 1 FROM framework_criteria fc
  WHERE fc.framework_id = rubric_fw.id AND fc.criterion_key = t.criterion_key
);

-- Insert Scoring Rules for all criteria
-- Standard 5-level rubric: Not Addressed, Mentioned, Explored, Mastered, Exemplary
WITH all_criteria AS (
  SELECT id FROM framework_criteria
)
INSERT INTO framework_scoring_rules (criterion_id, score_level, label, description, min_score, max_score)
SELECT id, level, label, description, min_score, max_score
FROM all_criteria,
LATERAL (VALUES
  (1, 'Not Addressed', 'Criterion not discussed or addressed', 0, 20),
  (2, 'Mentioned', 'Criterion briefly mentioned or acknowledged', 21, 40),
  (3, 'Explored', 'Criterion discussed and explored in detail', 41, 70),
  (4, 'Mastered', 'Criterion thoroughly handled and demonstrated', 71, 90),
  (5, 'Exemplary', 'Exceptional handling showing deep expertise', 91, 100)
) AS scoring(level, label, description, min_score, max_score)
WHERE NOT EXISTS (
  SELECT 1 FROM framework_scoring_rules fsr
  WHERE fsr.criterion_id = all_criteria.id AND fsr.score_level = scoring.level
);
