import pdfplumber
import sys
import re
import json

def extract_from_text(pdf_path, year, round_num):
    print(f"Parsing {pdf_path} using coordinate-based table extraction...")
    data = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            current_college_code = None
            current_college_name = None
            
            for page_num, page in enumerate(pdf.pages):
                print(f"Processing page {page_num+1} / {len(pdf.pages)}...", end='\r')
                
                # Extract text lines with coordinates
                words = page.extract_words()
                lines = []
                current_line_words = []
                last_top = -1
                for word in words:
                    if abs(word['top'] - last_top) > 2 and current_line_words:
                        lines.append({
                            'text': ' '.join([w['text'] for w in current_line_words]),
                            'top': current_line_words[0]['top'],
                            'bottom': current_line_words[0]['bottom']
                        })
                        current_line_words = []
                    current_line_words.append(word)
                    last_top = word['top']
                if current_line_words:
                    lines.append({
                        'text': ' '.join([w['text'] for w in current_line_words]),
                        'top': current_line_words[0]['top'],
                        'bottom': current_line_words[0]['bottom']
                    })

                # Find college and branches on this page
                courses_on_page = [] # {'top': y, 'code': ..., 'name': ...}
                
                for line in lines:
                    text = line['text']
                    # Check College
                    col_match = re.search(r"^(\d{4,5})\s*-\s*(.+)$", text)
                    if col_match:
                        current_college_code = col_match.group(1)
                        current_college_name = col_match.group(2).strip()
                    
                    # Check Branch (9 or 10 digit code)
                    # Many PDFs use formats like "301224510 - Computer Engineering" or "0100219110"
                    br_match = re.search(r"(\d{9,10})\s*-\s*(.+?)(?=\s\d|$)", text)
                    if br_match:
                        courses_on_page.append({
                            'top': line['top'],
                            'code': br_match.group(1),
                            'name': br_match.group(2).strip()
                        })

                # Find tables
                tables = page.find_tables()
                if not tables:
                    continue
                    
                table_data = page.extract_tables()
                
                for t_idx, table_obj in enumerate(tables):
                    t_bbox = table_obj.bbox # (x0, top, x1, bottom)
                    t_top = t_bbox[1]
                    
                    # Find the closest course above this table
                    closest_course = None
                    min_dist = float('inf')
                    for course in courses_on_page:
                        if course['top'] < t_top:
                            dist = t_top - course['top']
                            if dist < min_dist:
                                min_dist = dist
                                closest_course = course
                                
                    if not closest_course or not current_college_code:
                        continue
                        
                    # Parse the table data
                    t_data = table_data[t_idx]
                    if not t_data or len(t_data) < 2:
                        continue
                        
                    headers = t_data[0] # e.g. [None, 'GOPENS', 'GSTS']
                    
                    # Store cutoffs for this branch
                    branch_cutoffs = []
                    
                    for row_idx in range(1, len(t_data)):
                        row = t_data[row_idx]
                        if not row or row[0] not in ['I', 'II', 'III', 'PWDC', 'DEF1']:
                            # Only process primary stage rows for percentiles, or specific categories
                            # MHT CET stage rows usually start with 'I'
                            if not row or not row[0]: continue

                        for col_idx in range(1, len(headers)):
                            cat_name = headers[col_idx]
                            cell_val = row[col_idx]
                            if not cat_name or not cell_val:
                                continue
                            
                            cat_name = cat_name.replace('\n', '').strip()
                            cell_val = str(cell_val).strip()
                            
                            # cell_val is usually something like "18608\n(93.8492553)"
                            # Let's extract the percentile
                            perc_match = re.search(r"\((9\d{1}\.\d+|100\.0+|[0-8]?\d\.\d+)\)", cell_val)
                            merit_match = re.search(r"^(\d+)", cell_val)
                            
                            if perc_match:
                                percentile = float(perc_match.group(1))
                                merit = int(merit_match.group(1)) if merit_match else None
                                
                                branch_cutoffs.append({
                                    "category": cat_name,
                                    "percentile": percentile,
                                    "merit_no": merit
                                })
                                
                    if branch_cutoffs:
                        data.append({
                            "college_id": current_college_code,
                            "college_name": current_college_name,
                            "branch_code": closest_course['code'],
                            "branch": closest_course['name'],
                            "academic_year": year,
                            "cap_round": round_num,
                            "cutoffs": branch_cutoffs
                        })
                        
            print("\nExtraction complete. Formatting JSON...")
        
        out_name = f"parsed_cutoffs.json"
        with open(out_name, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Data saved to {out_name}")
        
    except Exception as e:
        print(f"Error parsing PDF: {e}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('file')
    parser.add_argument('--year', default='24-25')
    parser.add_argument('--round', type=int, default=3)
    args = parser.parse_args()
    
    extract_from_text(args.file, args.year, args.round)
