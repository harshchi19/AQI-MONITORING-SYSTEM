#!/usr/bin/env python
import re

# Read the file
with open(r'D:\ADS_Project\aqi-monitoring-system\backend\monitoring\views.py', 'r') as f:
    content = f.read()

# Replace all DjangoFilterBackend references
content = re.sub(r'filter_backends = \[DjangoFilterBackend, filters\.SearchFilter\]', 'filter_backends = [filters.SearchFilter]', content)
content = re.sub(r'filter_backends = \[DjangoFilterBackend\]', 'filter_backends = []', content)

# Write back to file
with open(r'D:\ADS_Project\aqi-monitoring-system\backend\monitoring\views.py', 'w') as f:
    f.write(content)

print("Fixed all DjangoFilterBackend references")