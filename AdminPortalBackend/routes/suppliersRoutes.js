const express = require("express");

const {
  getSuppliers,
  getSupplierById,
} = require("../controllers/suppliersController");

const router = express.Router();

router.get("/", getSuppliers);

router.get("/:id", getSupplierById);

module.exports = router;