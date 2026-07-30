const router = require('express').Router();
const authAdmin = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadMedia = require('../middleware/uploadMedia');

const auth = require('../controllers/auth');
const projects = require('../controllers/projects');
const skills = require('../controllers/skills');
const blog = require('../controllers/blog');
const experience = require('../controllers/experience');
const education = require('../controllers/education');
const contact = require('../controllers/contact');
const subscriber = require('../controllers/subscriber');
const visitor = require('../controllers/visitor');
const settings = require('../controllers/settings');
const uploadCtrl = require('../controllers/upload');

/* ── Health ── */
router.get('/health', (_, res) => res.json({ success: true, status: 'online', time: new Date().toISOString() }));

/* ── Public ── */
router.post('/contact', contact.submit);
router.post('/newsletter', subscriber.subscribe);

router.get('/projects', projects.getAll);
router.get('/projects/featured', projects.getFeatured);
router.get('/projects/stats', projects.getStats);
router.get('/projects/:slug', projects.getBySlug);

router.get('/skills', skills.getAll);

router.get('/blog', blog.getAll);
router.get('/blog/:slug', blog.getBySlug);

router.get('/experience', experience.getAll);
router.get('/education', education.getAll);

router.get('/settings', settings.getAll);

router.post('/visitor/track', visitor.track);

/* ── Admin Auth ── */
router.post('/admin/login', auth.login);
router.post('/admin/change-password', authAdmin, auth.changePassword);
router.get('/admin/verify', authAdmin, auth.verifyToken);

/* ── Admin Dashboard ── */
router.get('/admin/dashboard', authAdmin, settings.dashboard);

/* ── Admin: Contacts ── */
router.get('/admin/contacts', authAdmin, contact.getAll);
router.get('/admin/contacts/:id', authAdmin, contact.getOne);
router.patch('/admin/contacts/:id', authAdmin, contact.update);
router.delete('/admin/contacts/:id', authAdmin, contact.remove);

/* ── Admin: Subscribers ── */
router.get('/admin/subscribers', authAdmin, subscriber.getAll);
router.delete('/admin/subscribers/:email', authAdmin, subscriber.remove);
router.post('/admin/newsletter/broadcast', authAdmin, subscriber.broadcast);

/* ── Admin: Projects ── */
router.get('/admin/projects', authAdmin, projects.getAll);
router.post('/admin/projects', authAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]), projects.create);
router.put('/admin/projects/:id', authAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]), projects.update);
router.patch('/admin/projects/:id/publish', authAdmin, projects.togglePublish);
router.delete('/admin/projects/:id', authAdmin, projects.remove);
router.post('/admin/projects/:id/images', authAdmin, upload.single('image'), projects.addImage);
router.delete('/admin/projects/:id/images/:imageId', authAdmin, projects.removeImage);
router.put('/admin/projects/:id/images/reorder', authAdmin, projects.reorderImages);

/* ── Admin: Skills ── */
router.post('/admin/skills', authAdmin, skills.create);
router.put('/admin/skills/:id', authAdmin, skills.update);
router.delete('/admin/skills/:id', authAdmin, skills.remove);

/* ── Admin: Blog ── */
router.get('/admin/blog', authAdmin, blog.getAll);
router.post('/admin/blog', authAdmin, upload.single('cover_image'), blog.create);
router.put('/admin/blog/:id', authAdmin, upload.single('cover_image'), blog.update);
router.patch('/admin/blog/:id/publish', authAdmin, blog.togglePublish);
router.delete('/admin/blog/:id', authAdmin, blog.remove);

/* ── Admin: Experience ── */
router.post('/admin/experience', authAdmin, experience.create);
router.put('/admin/experience/:id', authAdmin, experience.update);
router.delete('/admin/experience/:id', authAdmin, experience.remove);

/* ── Admin: Education ── */
router.post('/admin/education', authAdmin, education.create);
router.put('/admin/education/:id', authAdmin, education.update);
router.delete('/admin/education/:id', authAdmin, education.remove);

/* ── Admin: Settings ── */
router.put('/admin/settings', authAdmin, settings.update);

/* ── Admin: Upload ── */
router.post('/admin/upload', authAdmin, uploadMedia.single('file'), uploadCtrl.uploadFile);

/* ── Admin: Analytics ── */
router.get('/admin/analytics', authAdmin, visitor.getAnalytics);
router.get('/admin/analytics/visitors', authAdmin, visitor.getVisitors);

module.exports = router;
