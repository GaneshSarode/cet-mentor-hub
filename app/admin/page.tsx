"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { getAdminClient } from "@/lib/supabase";

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [paperId, setPaperId] = useState("");
  const [status, setStatus] = useState<"idle" | "parsing" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState({ total: 0, uploaded: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !paperId) {
      setErrorMsg("Please select a file and provide a paper ID.");
      setStatus("error");
      return;
    }

    setStatus("parsing");
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setStatus("uploading");
          const questions = results.data as any[];
          setStats({ total: questions.length, uploaded: 0 });

          // Supabase client from browser? We shouldn't use admin client from browser usually, 
          // but for this internal tool if anon key = service role, it works.
          // Note: In production you should build a secure backend API endpoint for this.
          // Let's create the secure API route approach below.
          
          const res = await fetch('/api/admin/questions/bulk-upload', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paperId, questions })
          });

          const data = await res.json();
          if (data.error) throw new Error(data.error);

          setStats({ total: questions.length, uploaded: data.inserted });
          setStatus("success");
          setFile(null);
          
          setTimeout(() => {
             setStatus("idle");
          }, 3000);

        } catch (err: any) {
          setErrorMsg(err.message || "Failed to upload questions.");
          setStatus("error");
        }
      },
      error: (error) => {
        setErrorMsg(`CSV Parse Error: ${error.message}`);
        setStatus("error");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Paper ID (UUID)</label>
            <input 
              type="text" 
              value={paperId} 
              onChange={e => setPaperId(e.target.value)} 
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Questions CSV File</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed border-border rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none">
                  <div className="flex flex-col items-center space-y-2">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="font-medium text-muted-foreground">
                          {file ? file.name : "Drop CSV to upload, or click to browse"}
                      </span>
                  </div>
                  <input type="file" name="file_upload" className="hidden" accept=".csv" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div className="pt-4">
            <Button 
               onClick={handleUpload} 
               disabled={!file || !paperId || status === 'uploading' || status === 'parsing'}
            >
               {status === 'uploading' ? `Uploading... (${stats.uploaded}/${stats.total})` : status === 'parsing' ? 'Parsing...' : 'Upload Questions'}
            </Button>
          </div>

          {status === 'success' && (
             <div className="p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md flex items-center gap-2 border border-green-500/20">
               <CheckCircle className="w-5 h-5"/>
               Successfully uploaded {stats.uploaded} questions!
             </div>
          )}

          {status === 'error' && (
             <div className="p-4 bg-red-500/10 text-red-700 dark:text-red-400 rounded-md flex items-center gap-2 border border-red-500/20">
               <AlertCircle className="w-5 h-5"/>
               {errorMsg}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
