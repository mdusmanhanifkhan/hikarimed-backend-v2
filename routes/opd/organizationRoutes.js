import express from "express";
import { addOrganization, deleteOrganization, getOrganizations, updateOrganization } from "../../controller/opd/OrganizationController.js";
const router = express.Router();


// ✅ Routes
router.post('/organization', addOrganization); // Add org
router.get('/organization', getOrganizations); // Get all orgs
router.put('/organization/:id', updateOrganization); // Update org
router.delete('/organization/:id', deleteOrganization); // Delete org

export default router;
