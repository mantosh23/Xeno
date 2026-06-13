const supabase = require('../config/supabase');

/**
 * @function getAllAutomations
 * @description Retrieves a list of all automations from the database, ordered by ID ascending.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the array of automations.
 */
exports.getAllAutomations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({ success: true, automations: data });
  } catch (error) {
    console.error('Error fetching automations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @function toggleAutomationStatus
 * @description Updates the status (active/paused) of a specific automation workflow.
 * @param {import('express').Request} req - The Express request object. Requires `id` in params and `status` in body.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the updated automation record.
 */
exports.toggleAutomationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' or 'paused'

  try {
    const { data, error } = await supabase
      .from('automations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, automation: data });
  } catch (error) {
    console.error('Error toggling automation status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @function updateAutomation
 * @description Updates an existing automation workflow's details (title, description, triggers, actions, etc.).
 * @param {import('express').Request} req - The Express request object. Requires `id` in params and updated fields in body.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the updated automation record.
 */
exports.updateAutomation = async (req, res) => {
  const { id } = req.params;
  const { workflow_data, title, description, triggers, actions } = req.body;

  try {
    const { data, error } = await supabase
      .from('automations')
      .update({ workflow_data, title, description, triggers, actions })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, automation: data });
  } catch (error) {
    console.error('Error updating automation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @function createAutomation
 * @description Creates a new automation workflow in the database.
 * @param {import('express').Request} req - The Express request object containing automation configuration in body.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response with status 201 containing the newly created automation record.
 */
exports.createAutomation = async (req, res) => {
  const { title, description, triggers, actions, status, icon, color, bgColor, stats_sent, stats_converted } = req.body;

  try {
    const { data, error } = await supabase
      .from('automations')
      .insert([{ title, description, triggers, actions, status, icon, color, bg_color: bgColor, stats_sent, stats_converted }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ success: true, automation: data });
  } catch (error) {
    console.error('Error creating automation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @function deleteAutomation
 * @description Deletes a specific automation workflow from the database by ID.
 * @param {import('express').Request} req - The Express request object. Requires `id` in params.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response indicating success or failure.
 */
exports.deleteAutomation = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting automation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
