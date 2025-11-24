"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Send, Save } from 'lucide-react'
import { toast } from 'sonner'
import { format, addDays, addHours } from 'date-fns'

/**
 * SchedulePost Component
 * 
 * Schedule posts for future publication
 * Timezone support and quick scheduling options
 */

export default function SchedulePost({ scheduledFor, timezone = 'UTC', onUpdate }) {
    const [scheduleDate, setScheduleDate] = useState(
        scheduledFor ? format(new Date(scheduledFor), "yyyy-MM-dd") : ''
    )
    const [scheduleTime, setScheduleTime] = useState(
        scheduledFor ? format(new Date(scheduledFor), "HH:mm") : ''
    )
    const [selectedTimezone, setSelectedTimezone] = useState(timezone)

    // Quick schedule options
    const quickOptions = [
        { label: 'In 1 hour', value: addHours(new Date(), 1) },
        { label: 'In 3 hours', value: addHours(new Date(), 3) },
        { label: 'Tomorrow 9 AM', value: new Date(new Date().setHours(9, 0, 0, 0) + 86400000) },
        { label: 'In 1 week', value: addDays(new Date(), 7) }
    ]

    // Timezones
    const timezones = [
        { label: 'UTC', value: 'UTC' },
        { label: 'IST (India)', value: 'Asia/Kolkata' },
        { label: 'EST (US East)', value: 'America/New_York' },
        { label: 'PST (US West)', value: 'America/Los_Angeles' },
        { label: 'GMT (London)', value: 'Europe/London' },
        { label: 'CET (Central Europe)', value: 'Europe/Paris' }
    ]

    // Handle quick schedule
    const handleQuickSchedule = (date) => {
        setScheduleDate(format(date, "yyyy-MM-dd"))
        setScheduleTime(format(date, "HH:mm"))
        toast.success(`Scheduled for ${format(date, 'PPpp')}`)
    }

    // Handle save schedule
    const handleSave = () => {
        if (!scheduleDate || !scheduleTime) {
            toast.error('Please select both date and time')
            return
        }

        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`)

        if (scheduledDateTime <= new Date()) {
            toast.error('Scheduled time must be in the future')
            return
        }

        if (onUpdate) {
            onUpdate({
                scheduledFor: scheduledDateTime,
                timezone: selectedTimezone,
                isScheduled: true
            })
        }

        toast.success(`Post scheduled for ${format(scheduledDateTime, 'PPpp')} ${selectedTimezone}`)
    }

    // Clear schedule
    const handleClear = () => {
        setScheduleDate('')
        setScheduleTime('')
        if (onUpdate) {
            onUpdate({
                scheduledFor: null,
                isScheduled: false
            })
        }
        toast.success('Schedule cleared')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule Post
                </CardTitle>
                <CardDescription>
                    Schedule this post to be published at a specific time
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Schedule Options */}
                <div>
                    <Label className="text-sm font-medium mb-2 block">Quick Schedule</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {quickOptions.map(option => (
                            <Button
                                key={option.label}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickSchedule(option.value)}
                            >
                                <Clock className="mr-2 h-3 w-3" />
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Custom Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="scheduleDate">Date</Label>
                        <input
                            id="scheduleDate"
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={format(new Date(), "yyyy-MM-dd")}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <Label htmlFor="scheduleTime">Time</Label>
                        <input
                            id="scheduleTime"
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                </div>

                {/* Timezone */}
                <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                        <SelectTrigger id="timezone">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {timezones.map(tz => (
                                <SelectItem key={tz.value} value={tz.value}>
                                    {tz.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Preview */}
                {scheduleDate && scheduleTime && (
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm font-medium">Scheduled For:</p>
                        <p className="text-lg font-bold">
                            {format(new Date(`${scheduleDate}T${scheduleTime}`), 'PPpp')}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedTimezone}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        Save Schedule
                    </Button>
                    {(scheduleDate || scheduleTime) && (
                        <Button variant="outline" onClick={handleClear}>
                            Clear
                        </Button>
                    )}
                </div>

                {/* Info */}
                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    <p className="font-medium mb-1">ℹ️ How it works:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Post will be automatically published at the scheduled time</li>
                        <li>You can edit or cancel the schedule anytime before publishing</li>
                        <li>Scheduled posts appear in your drafts until published</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
