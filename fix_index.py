import re

with open('index.html', 'r') as f:
    content = f.read()

# remove noscript from head
content = re.sub(r'<noscript><img height="1" width="1" style="display:none"\s*src="https://www.facebook.com/tr\?id=1574588364174783&ev=PageView&noscript=1"\s*/></noscript>', '', content)

# insert noscript after <body>
body_index = content.find('<body>')
if body_index != -1:
    content = content[:body_index+6] + '\n    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1574588364174783&ev=PageView&noscript=1" /></noscript>' + content[body_index+6:]

with open('index.html', 'w') as f:
    f.write(content)
