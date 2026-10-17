import importlib.util
s=importlib.util.spec_from_file_location('extractor','scripts/trails/extract_trails.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
for i,name in enumerate(['easiest','easy','intermediate','difficult','expert']):assert m.difficulty_bucket({'mtb:scale:imba':str(i)})==name
for tags in [{},{'mtb:scale':'3'},{'mtb:scale:imba':'-1'},{'mtb:scale:imba':'5'},{'mtb:scale:imba':'2;3'}]:assert m.difficulty_bucket(tags)=='unknown'
assert m.surface_group('mystery')=='unknown'
assert m.trail_class({'highway':'path'},['mtb'])=='mtb'
print('PASS: exact IMBA 0–4 mapping; no STS conversion or fabricated unknowns.')
