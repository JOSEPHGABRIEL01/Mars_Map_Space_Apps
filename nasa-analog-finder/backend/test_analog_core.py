"""Tests for the Analog Finder similarity engine.

Run from the backend directory:

    python -m unittest -v
"""

from __future__ import annotations

import unittest

import analog_core as core


class DatasetTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.targets, cls.candidates, cls.source = core.load_datasets()

    def test_datasets_load_from_json(self) -> None:
        self.assertEqual(self.source, "json")
        self.assertEqual(len(self.targets), 4)
        self.assertEqual(len(self.candidates), 50)

    def test_every_target_has_a_body(self) -> None:
        bodies = {target.get("Cuerpo") for target in self.targets}
        self.assertEqual(bodies, {"Luna", "Marte"})

    def test_targets_filter_by_body_alias(self) -> None:
        moon = core.select_targets(self.targets, "Moon")
        mars = core.select_targets(self.targets, "marte")
        self.assertEqual(len(moon), 2)
        self.assertEqual(len(mars), 2)
        self.assertTrue(all(item["Cuerpo"] == "Luna" for item in moon))
        self.assertTrue(all(item["Cuerpo"] == "Marte" for item in mars))

    def test_invalid_body_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            core.select_targets(self.targets, "Venus")

    def test_csv_source_returns_same_counts(self) -> None:
        targets, candidates, source = core.load_datasets(source="csv")
        self.assertEqual(source, "csv")
        self.assertEqual(len(targets), 4)
        self.assertEqual(len(candidates), 50)
        self.assertTrue(
            all(
                candidate.get("Pais_Region")
                for candidate in candidates
            )
        )


class SimilarityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.targets, cls.candidates, _ = core.load_datasets()

    def test_exact_match_scores_one_hundred(self) -> None:
        target = self.candidates[0]
        result = core.compare(target, target)
        self.assertEqual(result["score"], 100.0)
        self.assertEqual(result["parameterCount"], len(core.PARAM_KEYS))

    def test_identical_records_have_perfect_breakdown(self) -> None:
        target = self.candidates[3]
        result = core.compare(target, target)
        for item in result["breakdown"].values():
            self.assertEqual(item["match"], 100.0)

    def test_missing_values_are_excluded(self) -> None:
        target = {"Temp_Max(C°)": 40, "Pendiente°": 5}
        candidate = {"Temp_Max(C°)": 40, "Temp_Min(C°)" : -80}
        result = core.compare(candidate, target)
        self.assertEqual(result["parameterCount"], 1)
        self.assertIn("Temp_Max(C°)", result["breakdown"])
        self.assertNotIn("Temp_Min(C°)", result["breakdown"])

    def test_missing_value_is_not_read_as_zero(self) -> None:
        target = {"Temp_Max(C°)": 0}
        with_zero = core.compare({"Temp_Max(C°)": 0}, target)
        missing = core.compare({"Temp_Min(C°)": 0}, target)
        self.assertEqual(with_zero["score"], 100.0)
        # The candidate has no comparable value at all, so it cannot receive a
        # perfect score just because zero equals zero.
        self.assertEqual(missing["score"], 0.0)
        self.assertEqual(missing["parameterCount"], 0)

    def test_distance_reduces_the_score(self) -> None:
        target = {"Pendiente°": 10}
        near = core.compare({"Pendiente°": 11}, target)
        far = core.compare({"Pendiente°": 30}, target)
        self.assertGreater(near["score"], far["score"])

    def test_ordering_is_descending(self) -> None:
        ranked = core.rank_candidates(self.candidates, self.targets[0])
        scores = [item["match"]["score"] for item in ranked]
        self.assertEqual(scores, sorted(scores, reverse=True))
        self.assertEqual(len(ranked), len(self.candidates))

    def test_dataset_order_is_kept_for_equal_scores(self) -> None:
        target = {"Pendiente°": 5}
        candidates = [
            {"Sitio": "A", "Pendiente°": 5},
            {"Sitio": "B", "Pendiente°": 5},
        ]
        ranked = core.rank_candidates(candidates, target)
        self.assertEqual([item["Sitio"] for item in ranked], ["A", "B"])

    def test_no_shared_parameters_scores_zero(self) -> None:
        result = core.compare({}, {"Pendiente°": 5})
        self.assertEqual(result["score"], 0.0)
        self.assertEqual(result["parameterCount"], 0)


class ValidationTests(unittest.TestCase):
    def test_empty_target_requires_a_value(self) -> None:
        values, errors, provided = core.validate_target({})
        self.assertEqual(provided, 0)
        self.assertIn("_form", errors)
        self.assertTrue(all(value is None for value in values.values()))

    def test_blank_strings_are_treated_as_missing(self) -> None:
        values, errors, provided = core.validate_target(
            {"Pendiente°": "   ", "Indice_vegetacion(NDVI)": None}
        )
        self.assertEqual(provided, 0)
        self.assertIn("_form", errors)
        self.assertIsNone(values["Pendiente°"])

    def test_partial_target_counts_only_provided_values(self) -> None:
        values, errors, provided = core.validate_target(
            {"Pendiente°": "5", "Indice_vegetacion(NDVI)": "0.08"}
        )
        self.assertEqual(errors, {})
        self.assertEqual(provided, 2)
        self.assertEqual(values["Pendiente°"], 5.0)
        self.assertIsNone(values["Temp_Max(C°)"])
        self.assertIsNone(values["Amplitud_termica_(Delta_T)"])

    def test_out_of_range_values_are_rejected(self) -> None:
        for payload in (
            {"Temp_Max(C°)": -500},
            {"Temp_Min(C°)": 200},
            {"Pendiente°": 120},
            {"Indice_vegetacion(NDVI)": 2},
            {"Polvo/aerosoles": -1},
            {"Azufres_Sulfatos": 9},
        ):
            with self.subTest(payload=payload):
                _, errors, _ = core.validate_target(payload)
                self.assertTrue(errors)
                self.assertNotIn("_form", errors)

    def test_non_numeric_values_are_rejected(self) -> None:
        _, errors, _ = core.validate_target({"Pendiente°": "steep"})
        self.assertIn("Pendiente°", errors)

    def test_boolean_is_not_a_number(self) -> None:
        _, errors, _ = core.validate_target({"Pendiente°": True})
        self.assertIn("Pendiente°", errors)

    def test_thermal_range_is_derived_when_missing(self) -> None:
        values, errors, provided = core.validate_target(
            {"Temp_Max(C°)": 46, "Temp_Min(C°)": 6}
        )
        self.assertEqual(errors, {})
        self.assertEqual(values["Amplitud_termica_(Delta_T)"], 40.0)
        self.assertEqual(provided, 3)

    def test_explicit_thermal_range_is_kept(self) -> None:
        values, errors, _ = core.validate_target(
            {
                "Temp_Max(C°)": 46,
                "Temp_Min(C°)": 6,
                "Amplitud_termica_(Delta_T)": 30,
            }
        )
        self.assertEqual(errors, {})
        self.assertEqual(values["Amplitud_termica_(Delta_T)"], 30.0)

    def test_maximum_below_minimum_is_rejected(self) -> None:
        _, errors, _ = core.validate_target({"Temp_Max(C°)": 5, "Temp_Min(C°)": 10})
        self.assertIn("Temp_Max(C°)", errors)

    def test_target_must_be_an_object(self) -> None:
        _, errors, provided = core.validate_target([1, 2, 3])
        self.assertEqual(provided, 0)
        self.assertIn("_form", errors)


class CatalogTests(unittest.TestCase):
    def test_catalog_matches_engine_parameters(self) -> None:
        catalog = core.catalog()
        self.assertEqual(list(catalog), list(core.PARAM_KEYS))
        for key, meta in catalog.items():
            self.assertIn("label", meta)
            self.assertIn("unit", meta)
            self.assertIn("scale", meta)
            self.assertIn("weight", meta)
            self.assertIn("min", meta)
            self.assertIn("max", meta)
            self.assertLess(meta["min"], meta["max"])

    def test_catalog_is_a_copy(self) -> None:
        catalog = core.catalog()
        catalog["Pendiente°"]["min"] = -999
        self.assertEqual(core.PARAMETERS["Pendiente°"]["min"], 0)


if __name__ == "__main__":
    unittest.main()
