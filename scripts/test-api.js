const http = require('http');

const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}/api/complaints`;

// Helper for HTTP requests using native fetch
const request = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => null);
  return { status: response.status, data };
};

const runTests = async () => {
  console.log('====================================================');
  console.log('   CAMPUS COMPLAINT TRACKER - API TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`   PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  FAIL: ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  };

  // Set test port
  process.env.PORT = String(PORT);
  const { app, server } = require('../server');

  // Wait 1.5s for DB connection to establish
  await new Promise((resolve) => setTimeout(resolve, 2000));

  let createdId1 = null;
  let createdId2 = null;

  try {
    // 1. Health check
    console.log('\n--- 1. Base Endpoint / Health Check ---');
    const health = await request(`http://localhost:${PORT}/`);
    assert(health.status === 200 && health.data.success === true, 'GET / - API health & route index');

    // 2. Create Complaints
    console.log('\n--- 2. Create Complaint (POST /api/complaints) ---');
    const res1 = await request('', {
      method: 'POST',
      body: JSON.stringify({
        studentName: 'Aarav Patel',
        email: 'aarav.patel@campus.edu',
        title: 'Broken Projector in Lecture Hall 3',
        description: 'The ceiling projector is flickering constantly and shuts down after 10 minutes of usage.',
        category: 'Infrastructure',
        priority: 'High',
        location: 'Lecture Hall 3, Block A'
      })
    });
    assert(res1.status === 201 && res1.data.success === true, 'POST /api/complaints - Create Infrastructure/High complaint');
    assert(res1.data.data.status === 'Open', 'Verify default status is "Open"');
    assert(res1.data.data.createdAt !== undefined, 'Verify createdAt timestamp is present');
    createdId1 = res1.data.data._id;

    const res2 = await request('', {
      method: 'POST',
      body: JSON.stringify({
        studentName: 'Sneha Sharma',
        email: 'sneha.sharma@campus.edu',
        title: 'Wi-Fi Connection Dropping in Library 2nd Floor',
        description: 'Students are unable to access research journals due to Wi-Fi drops.',
        category: 'IT',
        priority: 'Medium',
        location: 'Central Library, 2nd Floor'
      })
    });
    assert(res2.status === 201, 'POST /api/complaints - Create IT/Medium complaint');
    createdId2 = res2.data.data._id;

    const res3 = await request('', {
      method: 'POST',
      body: JSON.stringify({
        studentName: 'Rohan Verma',
        email: 'rohan.verma@campus.edu',
        title: 'Water Cooler Leakage near Cafeteria',
        description: 'Continuous water spillage from drinking water cooler creates slipping hazard.',
        category: 'Cleanliness',
        priority: 'Low',
        location: 'Main Cafeteria Entrance'
      })
    });
    assert(res3.status === 201, 'POST /api/complaints - Create Cleanliness/Low complaint');

    const res4 = await request('', {
      method: 'POST',
      body: JSON.stringify({
        studentName: 'Ananya Iyer',
        email: 'ananya.iyer@campus.edu',
        title: 'Faulty Emergency Exit Door Lock',
        description: 'Emergency exit door lock gets jammed and does not open smoothly.',
        category: 'Security',
        priority: 'High',
        location: 'Ground Floor, Block C'
      })
    });
    assert(res4.status === 201, 'POST /api/complaints - Create Security/High complaint');

    // 3. Validation Tests
    console.log('\n--- 3. Validation & Bad Request Handling ---');
    const missingRes = await request('', {
      method: 'POST',
      body: JSON.stringify({
        studentName: 'Incomplete User'
      })
    });
    assert(missingRes.status === 400 && missingRes.data.success === false, 'POST /api/complaints - Reject missing required fields with 400');

    const invalidCatRes = await request('', {
      method: 'POST',
      body: JSON.stringify({
        studentName: 'Test Student',
        email: 'test@campus.edu',
        title: 'Invalid Category Complaint',
        description: 'Testing invalid category enum rejection',
        category: 'InvalidCategory'
      })
    });
    assert(invalidCatRes.status === 400, 'POST /api/complaints - Reject invalid category enum with 400');

    const invalidPriRes = await request('', {
      method: 'POST',
      body: JSON.stringify({
        studentName: 'Test Student',
        email: 'test@campus.edu',
        title: 'Invalid Priority Complaint',
        description: 'Testing invalid priority enum rejection',
        priority: 'Urgent'
      })
    });
    assert(invalidPriRes.status === 400, 'POST /api/complaints - Reject invalid priority enum with 400');

    // 4. Get All Complaints
    console.log('\n--- 4. Get All Complaints (GET /api/complaints) ---');
    const getAll = await request('');
    assert(getAll.status === 200 && getAll.data.count >= 4, `GET /api/complaints - Returns all complaints (count: ${getAll.data.count})`);

    // 5. Query Filters
    console.log('\n--- 5. Query Parameter Filters ---');
    const filterStatus = await request('?status=Open');
    assert(
      filterStatus.status === 200 && filterStatus.data.data.every(c => c.status === 'Open'),
      'GET /api/complaints?status=Open - Filter complaints by status'
    );

    const filterCategory = await request('?category=IT');
    assert(
      filterCategory.status === 200 && filterCategory.data.data.every(c => c.category === 'IT'),
      'GET /api/complaints?category=IT - Filter complaints by category'
    );

    const filterPriority = await request('?priority=High');
    assert(
      filterPriority.status === 200 && filterPriority.data.data.every(c => c.priority === 'High'),
      'GET /api/complaints?priority=High - Filter complaints by priority'
    );

    // 6. Search functionality
    console.log('\n--- 6. Search by Title or Student Name ---');
    const searchTitle = await request('?search=Projector');
    assert(
      searchTitle.status === 200 && searchTitle.data.data.some(c => c.title.toLowerCase().includes('projector')),
      'GET /api/complaints?search=Projector - Case-insensitive search on title'
    );

    const searchName = await request('?search=sneha');
    assert(
      searchName.status === 200 && searchName.data.data.some(c => c.studentName.toLowerCase().includes('sneha')),
      'GET /api/complaints?search=sneha - Case-insensitive search on studentName'
    );

    // 7. Get Complaint By ID
    console.log('\n--- 7. Get Complaint By ID (GET /api/complaints/:id) ---');
    const getById = await request(`/${createdId1}`);
    assert(getById.status === 200 && getById.data.data._id === createdId1, 'GET /api/complaints/:id - Fetch single complaint by valid ID');

    const invalidIdRes = await request('/invalid-mongo-id-123');
    assert(invalidIdRes.status === 400 && invalidIdRes.data.success === false, 'GET /api/complaints/:id - Return 400 for invalid ObjectId format');

    const notFoundRes = await request('/507f1f77bcf86cd799439011');
    assert(notFoundRes.status === 404 && notFoundRes.data.success === false, 'GET /api/complaints/:id - Return 404 for non-existent ObjectId');

    // 8. Update Complaint (PUT)
    console.log('\n--- 8. Update Complaint (PUT /api/complaints/:id) ---');
    const updateRes = await request(`/${createdId1}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: 'Broken Projector in Lecture Hall 3 (Bulb Replaced)',
        priority: 'Medium',
        location: 'Lecture Hall 3, Block A (Near Podium)'
      })
    });
    assert(
      updateRes.status === 200 && updateRes.data.data.title.includes('Bulb Replaced'),
      'PUT /api/complaints/:id - Successfully update editable details'
    );

    // 9. Update Complaint Status (PATCH)
    console.log('\n--- 9. Update Status (PATCH /api/complaints/:id/status) ---');
    const patchStatusRes = await request(`/${createdId1}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'In Progress'
      })
    });
    assert(
      patchStatusRes.status === 200 && patchStatusRes.data.data.status === 'In Progress',
      'PATCH /api/complaints/:id/status - Update status to "In Progress"'
    );

    const patchInvalidStatus = await request(`/${createdId1}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'Cancelled' // Invalid status
      })
    });
    assert(
      patchInvalidStatus.status === 400 && patchInvalidStatus.data.success === false,
      'PATCH /api/complaints/:id/status - Reject invalid status enum with 400'
    );

    const patchResolved = await request(`/${createdId1}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'Resolved'
      })
    });
    assert(
      patchResolved.status === 200 && patchResolved.data.data.status === 'Resolved',
      'PATCH /api/complaints/:id/status - Update status to "Resolved"'
    );

    // 10. Delete Complaint (DELETE)
    console.log('\n--- 10. Delete Complaint (DELETE /api/complaints/:id) ---');
    const deleteRes = await request(`/${createdId2}`, {
      method: 'DELETE'
    });
    assert(deleteRes.status === 200 && deleteRes.data.success === true, 'DELETE /api/complaints/:id - Delete complaint successfully');

    const verifyDelete = await request(`/${createdId2}`);
    assert(verifyDelete.status === 404, 'GET /api/complaints/:id - Verify deleted complaint returns 404');

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    console.log('\n====================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('====================================================\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
