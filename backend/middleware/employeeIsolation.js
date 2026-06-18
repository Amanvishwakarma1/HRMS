export const enforceEmployeeIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Access Denied: User Not Authenticated.' });
  }

  const role = req.user.role.toLowerCase();
  const loggedInEmployeeId = Number(req.user.id);
  const loggedInUsername = req.user.username;

  // Let other roles (hr, admin, manager, finance) bypass isolation
  if (role !== 'employee') {
    return next();
  }

  // Block specific endpoints entirely for regular employees
  const reqPath = req.originalUrl.split('?')[0];
  if (reqPath === '/api/attendance/all' || reqPath === '/api/attendance/employees') {
    return res.status(403).json({ success: false, message: 'Forbidden: Employees cannot view all attendance records.' });
  }

  // 1. Path parameters check (:employeeId or :id for employee CRUD)
  if (req.params.employeeId) {
    const paramId = Number(req.params.employeeId);
    if (!isNaN(paramId) && paramId !== loggedInEmployeeId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot access another employee\'s data.' });
    }
  }

  // If hitting employee-specific CRUD (e.g. /api/employees/:id)
  if (req.params.id && req.baseUrl.includes('employees')) {
    // If param is a number (e.g. 4) or standard EMP string mapping to user id
    const paramId = Number(req.params.id.replace('EMP-00', ''));
    if (!isNaN(paramId) && paramId !== loggedInEmployeeId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot access another employee\'s profile.' });
    }
  }

  // 2. Query parameters check & override
  if (req.query.employeeId) {
    const queryId = Number(req.query.employeeId);
    if (!isNaN(queryId) && queryId !== loggedInEmployeeId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot query another employee\'s data.' });
    }
  }
  // Enforce/overwrite query employeeId
  req.query.employeeId = loggedInEmployeeId;

  // 3. Request Body check & override
  if (req.body) {
    if (req.body.employeeId) {
      const bodyId = Number(req.body.employeeId);
      if (!isNaN(bodyId) && bodyId !== loggedInEmployeeId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot submit data for another employee.' });
      }
    }
    // Enforce/overwrite body employeeId
    req.body.employeeId = loggedInEmployeeId;
  }

  // 4. Username matching for mock endpoints (e.g. /api/attendance/logs/:username)
  if (req.params.username) {
    const paramUser = req.params.username.trim().toLowerCase();
    const tokenUser = loggedInUsername.trim().toLowerCase();
    
    // Allow if they request their own username or the generic 'employee' username
    if (paramUser !== tokenUser && paramUser !== 'employee') {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot access logs for another username.' });
    }
  }

  next();
};
