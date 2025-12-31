<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\PermitLetter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PermitLetterController extends Controller
{
    public function index()
    {
        $permitLetters = auth()->user()
            ->permitLetters()
            ->with('attendance')
            ->orderBy('permit_date', 'desc')
            ->get();

        return Inertia::render('Employee/PermitLetters/Index', [
            'permitLetters' => $permitLetters,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'permit_date' => 'required|date',
            'reason' => 'required|string|in:sakit,izin,lainnya',
            'description' => 'nullable|string|max:500',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('permit_letters', $fileName, 'private');

        $permitLetter = auth()->user()->permitLetters()->create([
            'permit_date' => $validated['permit_date'],
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'status' => 'pending',
        ]);

        return back()->with('success', 'Surat izin berhasil diupload');
    }

    public function download(PermitLetter $permitLetter)
    {
        // Check if user owns this permit letter or is HR/Admin
        if (
            $permitLetter->user_id !== auth()->id() &&
            !auth()->user()->hasAnyRole(['admin', 'hr'])
        ) {
            abort(403);
        }

        return Storage::disk('private')->download(
            $permitLetter->file_path,
            $permitLetter->file_name
        );
    }

    public function destroy(PermitLetter $permitLetter)
    {
        // Only allow deletion if still pending and user owns it
        if ($permitLetter->user_id !== auth()->id() || $permitLetter->status !== 'pending') {
            abort(403);
        }

        Storage::disk('private')->delete($permitLetter->file_path);
        $permitLetter->delete();

        return back()->with('success', 'Surat izin berhasil dihapus');
    }
}
