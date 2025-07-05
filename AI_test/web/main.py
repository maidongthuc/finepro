from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/inspection', methods=['POST'])
def inspection_api():
    data = request.json
    # Xử lý logic API của bạn ở đây
    return jsonify({
        'status': 'success',
        'message': 'Data processed successfully',
        'data': data
    })

if __name__ == '__main__':
    app.run(debug=True)