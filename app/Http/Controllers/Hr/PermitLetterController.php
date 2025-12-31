<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\PermitLetter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PermitLetterController extends Controller
{
    public function approve(PermitLetter $permitLetter)
    {
        if ($permitLetter->status !== 'pending') {
            return back()->with('error', 'Surat izin sudah diproses');
        }

        $permitLetter->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Surat izin disetujui');
    }

    public function reject(Request $request, PermitLetter $permitLetter)
    {
        if ($permitLetter->status !== 'pending') {
            return back()->with('error', 'Surat izin sudah diproses');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $permitLetter->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return back()->with('success', 'Surat izin ditolak');
    }

    public function download(PermitLetter $permitLetter)
    {
        return Storage::disk('private')->download(
            $permitLetter->file_path,
            $permitLetter->file_name
        );
    }
}
