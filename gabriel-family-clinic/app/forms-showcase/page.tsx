/**
 * Form Components Showcase
 * 
 * Demonstrates all form components with WCAG AAA compliance,
 * Singapore localization, and elderly accessibility features.
 */

'use client';

import React, { useState } from 'react';
import { Input, Textarea, Select, Checkbox, Radio, Switch } from '@/components/forms';
import type { SelectOption, RadioOption } from '@/components/forms';

export default function FormsShowcase() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    medicalNotes: '',
    doctor: '',
    appointmentType: '',
    notifications: false,
    emailNotifications: true,
  });

  // Sample data
  const doctorOptions: SelectOption[] = [
    { value: 'dr-tan', label: 'Dr. Tan Wei Ming' },
    { value: 'dr-lim', label: 'Dr. Lim Siew Ling' },
    { value: 'dr-wong', label: 'Dr. Wong Mei Hua' },
    { value: 'dr-kumar', label: 'Dr. Kumar Rajesh' },
  ];

  const appointmentTypeOptions: RadioOption[] = [
    {
      value: 'consultation',
      label: 'General Consultation',
      description: 'Standard medical check-up and consultation',
    },
    {
      value: 'follow-up',
      label: 'Follow-up Appointment',
      description: 'Review of previous consultation or test results',
    },
    {
      value: 'vaccination',
      label: 'Vaccination',
      description: 'Immunisation and vaccination services',
    },
    {
      value: 'health-screening',
      label: 'Health Screening',
      description: 'Comprehensive health check package',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-neutral-900">
            Form Components Showcase
          </h1>
          <p className="text-lg text-neutral-600">
            WCAG AAA Compliant | Elderly-Friendly | Singapore Localized
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
              18px+ Font Size
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              44px+ Touch Targets
            </span>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
              7:1 Contrast Ratio
            </span>
          </div>
        </div>

        {/* Input Component */}
        <section className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Input Component
            </h2>
            <p className="text-neutral-600">
              Text input with Singapore phone formatting, validation, and accessibility
            </p>
          </div>

          <div className="space-y-6">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              helperText="As per NRIC"
              required
            />

            <Input
              label="Singapore Phone Number"
              type="tel"
              placeholder="+65 XXXX XXXX"
              helperText="8-digit Singapore phone number"
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              helperText="We'll never share your email"
            />

            <Input
              label="Input with Error"
              error="This field is required"
              placeholder="Required field"
            />

            <Input
              label="Large Input (Elderly-Friendly)"
              inputSize="lg"
              placeholder="Larger text and touch target"
              helperText="56px minimum height for easier interaction"
            />
          </div>
        </section>

        {/* Textarea Component */}
        <section className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Textarea Component
            </h2>
            <p className="text-neutral-600">
              Multi-line text input with character count and auto-resize
            </p>
          </div>

          <div className="space-y-6">
            <Textarea
              label="Medical Notes"
              placeholder="Describe your symptoms or concerns..."
              helperText="Please provide detailed information"
              rows={4}
            />

            <Textarea
              label="Notes with Character Count"
              placeholder="Type your notes here..."
              showCharCount
              maxLength={500}
              helperText="Maximum 500 characters"
            />

            <Textarea
              label="Auto-Resize Textarea"
              placeholder="This textarea grows as you type..."
              autoResize
              helperText="Automatically adjusts height to fit content"
            />

            <Textarea
              label="Large Textarea (Elderly-Friendly)"
              textareaSize="lg"
              placeholder="Larger text and more space for detailed notes"
              helperText="180px minimum height with 18px font size"
            />
          </div>
        </section>

        {/* Select Component */}
        <section className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Select Component
            </h2>
            <p className="text-neutral-600">
              Dropdown selection with keyboard navigation and accessibility
            </p>
          </div>

          <div className="space-y-6">
            <Select
              label="Preferred Doctor"
              placeholder="Select a doctor"
              options={doctorOptions}
              helperText="Choose your preferred healthcare provider"
              required
            />

            <Select
              label="Large Select (Elderly-Friendly)"
              selectSize="lg"
              placeholder="Select an option"
              options={doctorOptions}
              helperText="56px minimum height for easier selection"
            />

            <Select
              label="Select with Error"
              placeholder="Select an option"
              options={doctorOptions}
              error="Please select a doctor"
            />
          </div>
        </section>

        {/* Checkbox Component */}
        <section className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Checkbox Component
            </h2>
            <p className="text-neutral-600">
              Single and multiple selection with descriptions
            </p>
          </div>

          <div className="space-y-6">
            <Checkbox
              label="I agree to receive appointment reminders"
              helperText="We'll send you reminders via SMS and email"
            />

            <Checkbox
              label="Subscribe to newsletter"
              description="Get health tips and clinic updates"
              checked={formData.notifications}
              onChange={(e) =>
                setFormData({ ...formData, notifications: e.target.checked })
              }
            />

            <Checkbox
              label="Checkbox with Error"
              error="You must accept the terms and conditions"
              required
            />

            <div className="space-y-3">
              <p className="text-base font-medium text-neutral-900">
                Medical Conditions <span className="text-red-600">*</span>
              </p>
              <Checkbox label="Diabetes" checkboxSize="lg" />
              <Checkbox label="Hypertension" checkboxSize="lg" />
              <Checkbox label="Heart Disease" checkboxSize="lg" />
              <Checkbox label="Asthma" checkboxSize="lg" />
            </div>
          </div>
        </section>

        {/* Radio Component */}
        <section className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Radio Component
            </h2>
            <p className="text-neutral-600">
              Single selection from multiple options with descriptions
            </p>
          </div>

          <div className="space-y-6">
            <Radio
              label="Appointment Type"
              name="appointmentType"
              options={appointmentTypeOptions}
              value={formData.appointmentType}
              onChange={(value) =>
                setFormData({ ...formData, appointmentType: value })
              }
              helperText="Select the type of appointment you need"
              required
            />

            <Radio
              label="Horizontal Radio Group"
              name="paymentMethod"
              orientation="horizontal"
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'nets', label: 'NETS' },
                { value: 'credit', label: 'Credit Card' },
              ]}
              helperText="Choose your payment method"
            />

            <Radio
              label="Radio with Error"
              name="errorRadio"
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ]}
              error="Please select an option"
              required
            />
          </div>
        </section>

        {/* Switch Component */}
        <section className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Switch Component
            </h2>
            <p className="text-neutral-600">
              Toggle switch for binary options with clear on/off states
            </p>
          </div>

          <div className="space-y-6">
            <Switch
              label="Email Notifications"
              description="Receive appointment reminders and updates via email"
              checked={formData.emailNotifications}
              onChange={(e) =>
                setFormData({ ...formData, emailNotifications: e.target.checked })
              }
            />

            <Switch
              label="SMS Notifications"
              description="Get instant SMS alerts for appointments"
              helperText="Standard SMS rates apply"
            />

            <Switch
              label="Switch with On/Off Labels"
              description="Visual labels for clarity"
              showLabels
              onLabel="ON"
              offLabel="OFF"
            />

            <Switch
              label="Switch with Error"
              error="This setting must be enabled"
              required
            />

            <Switch
              label="Left-Aligned Switch"
              labelPosition="left"
              description="Switch positioned on the left side"
            />
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="bg-primary-50 rounded-xl p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-primary-900 mb-4">
            Accessibility Features
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-primary-900">WCAG AAA Compliance</h3>
              <ul className="space-y-1 text-primary-800">
                <li>✓ 7:1 contrast ratios for all text</li>
                <li>✓ 44px+ minimum touch targets</li>
                <li>✓ 18px+ minimum font size</li>
                <li>✓ Clear focus indicators</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary-900">Screen Reader Support</h3>
              <ul className="space-y-1 text-primary-800">
                <li>✓ Proper ARIA labels and descriptions</li>
                <li>✓ Error announcements (role=&quot;alert&quot;)</li>
                <li>✓ Required field indicators</li>
                <li>✓ Form validation states</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary-900">Keyboard Navigation</h3>
              <ul className="space-y-1 text-primary-800">
                <li>✓ Tab navigation support</li>
                <li>✓ Arrow key support for radio groups</li>
                <li>✓ Space/Enter for switches and checkboxes</li>
                <li>✓ Escape key handling</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary-900">Singapore Localization</h3>
              <ul className="space-y-1 text-primary-800">
                <li>✓ British English spelling</li>
                <li>✓ +65 phone number formatting</li>
                <li>✓ SGD currency (when applicable)</li>
                <li>✓ DD/MM/YYYY date format (when applicable)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Example */}
        <section className="bg-neutral-100 rounded-xl p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Usage Example
          </h2>
          <pre className="bg-neutral-900 text-neutral-100 p-6 rounded-lg overflow-x-auto text-sm">
{`import { Input, Textarea, Select, Checkbox, Radio, Switch } from '@/components/forms';

// Input with validation
<Input
  label="Full Name"
  placeholder="Enter your full name"
  error={errors.name?.message}
  required
/>

// Textarea with character count
<Textarea
  label="Medical Notes"
  showCharCount
  maxLength={500}
/>

// Select with options
<Select
  label="Preferred Doctor"
  options={doctorOptions}
  placeholder="Select a doctor"
/>

// Checkbox with description
<Checkbox
  label="Email Notifications"
  description="Receive updates via email"
/>

// Radio group
<Radio
  label="Appointment Type"
  name="appointmentType"
  options={appointmentTypeOptions}
/>

// Switch toggle
<Switch
  label="SMS Notifications"
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.target.checked)}
/>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
