import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EmailTemplate, EmailTemplateType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Send,
  Settings,
  History,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Eye,
  Edit3,
  RefreshCw,
  Sparkles,
  Sliders,
  Check,
  X
} from 'lucide-react';

export const AdminEmailManager: React.FC = () => {
  const {
    emailTemplates,
    emailLogs,
    emailSettings,
    updateEmailTemplate,
    updateEmailSettings,
    testSendEmail
  } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'logs' | 'settings'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  // Test Email Sending State
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testTemplateType, setTestTemplateType] = useState<EmailTemplateType>('email-verification');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(emailSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleOpenEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditSubject(template.subject);
    setEditBody(template.description || template.heading);
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    await updateEmailTemplate(selectedTemplate.id, {
      subject: editSubject,
      description: editBody
    });
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress) return;
    setTestSending(true);
    setTestResult(null);

    const res = await testSendEmail(testTemplateType, testEmailAddress);
    setTestSending(false);
    setTestResult({
      success: res.success,
      message: res.success ? `Test email (${testTemplateType}) sent successfully to ${testEmailAddress}!` : (res.error || 'Failed to send test email')
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEmailSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#5DE2E7]" />
            Email Management & Delivery System
          </h2>
          <p className="text-xs text-slate-300">
            Configure automated transaction emails, manage OTP and welcome templates, track sent email logs, and configure SMTP settings.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950/60 border border-white/10 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveSubTab('templates')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              activeSubTab === 'templates'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Templates ({emailTemplates.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              activeSubTab === 'logs'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Delivery Logs ({emailLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              activeSubTab === 'settings'
                ? 'bg-gradient-to-r from-[#133E87] to-cyan-500 text-white shadow-[0_0_15px_rgba(93,226,231,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Email Settings</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          {/* Quick Test Email Card */}
          <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-[#5DE2E7]/30 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-[#5DE2E7]" />
              <span>Send Live Test Email</span>
            </div>
            <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={testEmailAddress}
                onChange={e => setTestEmailAddress(e.target.value)}
                placeholder="Enter recipient email (e.g. your email)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#5DE2E7]"
              />
              <select
                value={testTemplateType}
                onChange={e => setTestTemplateType(e.target.value as any)}
                className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:outline-none focus:border-[#5DE2E7]"
              >
                <option value="email-verification">Verification OTP</option>
                <option value="welcome-email">Welcome Email</option>
                <option value="password-reset-otp">Password Reset OTP</option>
                <option value="password-changed">Password Changed Notice</option>
              </select>
              <button
                type="submit"
                disabled={testSending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#133E87] to-cyan-500 hover:from-[#133E87] hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-[0_0_15px_rgba(93,226,231,0.3)] disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testSending ? 'Sending...' : 'Send Test'}</span>
              </button>
            </form>
            {testResult && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${testResult.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {emailTemplates.map(tpl => (
              <div key={tpl.id} className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#5DE2E7]/20 text-[#5DE2E7] text-[10px] font-extrabold uppercase tracking-wider border border-[#5DE2E7]/30">
                      {tpl.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Updated: {new Date(tpl.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{tpl.name}</h3>
                  <div className="text-xs text-slate-300 font-medium">
                    <span className="text-slate-400 font-bold">Subject:</span> {tpl.subject}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3 bg-slate-950/40 p-3 rounded-xl font-mono text-[11px]">
                    {tpl.description || tpl.heading}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1 flex-wrap">
                    {['name', 'otp', 'email', 'link'].map(v => (
                      <span key={v} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-mono">
                        {`{${v}}`}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleOpenEdit(tpl)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#5DE2E7] text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#5DE2E7]" />
                Automated Transaction Email Logs
              </h3>
              <p className="text-xs text-slate-400">
                Track status and timestamps of all system-generated verification OTPs, welcome emails, and password resets.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden bg-slate-900/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-white/10 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Sent At</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <Mail className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                        <p className="font-bold text-sm text-slate-300">No emails sent yet</p>
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map(log => (
                      <tr key={log.id} className="hover:bg-white/[0.03] transition">
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          {new Date(log.sentAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">{log.recipient}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-[#5DE2E7] border border-[#5DE2E7]/20 text-[10px] font-bold">
                            {log.emailType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{log.subject}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5DE2E7]" />
              Sender & Delivery Configuration
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure the sender name, sender email, brand signatures, and SMTP server details.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Sender Name / Brand</label>
              <input
                type="text"
                value={settingsForm.senderName}
                onChange={e => setSettingsForm({ ...settingsForm, senderName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:outline-none focus:border-[#5DE2E7]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Sender Email Address</label>
              <input
                type="email"
                value={settingsForm.senderEmail}
                onChange={e => setSettingsForm({ ...settingsForm, senderEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:outline-none focus:border-[#5DE2E7]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Support Email</label>
              <input
                type="email"
                value={settingsForm.supportEmail}
                onChange={e => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:outline-none focus:border-[#5DE2E7]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Brand Display Name</label>
              <input
                type="text"
                value={settingsForm.brandName}
                onChange={e => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:outline-none focus:border-[#5DE2E7]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {settingsSaved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Settings updated successfully!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#133E87] to-cyan-500 hover:from-[#133E87] hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(93,226,231,0.3)]"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}

      {/* Edit Template Modal */}
      <AnimatePresence>
        {isEditing && selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl glass-panel border border-[#5DE2E7]/40 bg-[#0B1D51] p-6 space-y-4 shadow-[0_0_50px_rgba(11,29,81,0.9)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Edit Email Template</h3>
                  <p className="text-xs text-[#5DE2E7] font-bold">{selectedTemplate.name}</p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Email Subject</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={e => setEditSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:outline-none focus:border-[#5DE2E7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Email Body (Supports dynamic tags)</label>
                  <textarea
                    rows={8}
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#5DE2E7]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10 text-xs">
                  <span className="font-bold text-slate-300">Available Dynamic Tags: </span>
                  {['name', 'otp', 'email', 'link', 'brandName', 'supportEmail'].map(v => (
                    <span key={v} className="px-1.5 py-0.5 rounded bg-[#5DE2E7]/20 text-[#5DE2E7] text-[10px] font-mono ml-1">
                      {`{${v}}`}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#133E87] to-cyan-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(93,226,231,0.3)]"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
