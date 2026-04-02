# k6 Load Test

Student exam flow load test script:

```bash
k6 run load-tests/student-exam-flow.js \
  -e BASE_URL=http://localhost:3001 \
  -e STUDENT_TOKEN='<base64-dev-token>' \
  -e EXAM_ID='<exam-id>'
```

For realistic concurrent load, prefer multiple student tokens:

```bash
k6 run load-tests/student-exam-flow.js \
  -e BASE_URL=http://localhost:3001 \
  -e STUDENT_TOKENS='token1,token2,token3' \
  -e EXAM_ID='<exam-id>'
```

Dev token payload example before base64 encoding:

```json
{
  "userId": "student-load-1",
  "email": "student-load-1@example.com",
  "role": "student",
  "name": "Load Test Student 1"
}
```

Useful env vars:

- `AUTOSAVE_PER_VU`: how many answers each VU autosaves before submit
- `THINK_TIME_MS`: pause between autosaves
- `EXAM_ID`: optional fixed exam id; if omitted the script uses `/exams/assigned/me`
