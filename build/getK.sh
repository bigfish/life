#!/bin/bash
echo -n "Total size of pattern data: "
find . -name "*_o.png" | xargs ls -la | awk '{sum += $5} END {print sum/1024 }'

