const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('./index'); // Assuming your Express app is in the app.js file

chai.use(chaiHttp);
const { expect } = chai;

describe('Library API', () => {
    let server;
  beforeEach(() => {
    server = app.listen(8080);
    // Reset the library before each test
    app.library = [];
  });

  afterEach(() => {
    if(server){
        server.close(); // Stop the server after each test
    }
  });

  describe('POST /addBook', () => {
    it('should add a new book to the library', async () => {
        const bookTitle = 'The Great Gatsby';

        
      const response = await chai.request(app).post('/addBook').send({ book: bookTitle });

      expect(response).to.have.status(200);
      expect(response.body).to.have.property('success').to.equal(true);
      expect(app.library).to.include(bookTitle);
    });

    it('should handle invalid book title', async () => {
      const response = await chai.request(app).post('/addBook').send({ book: 123 });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('success').to.equal(false);
      expect(response.body).to.have.property('error').to.equal('Invalid book title');
    });

    it('should handle duplicate book title', async () => {
      app.library = ['The Great Gatsby'];

      const response = await chai.request(app).post('/addBook').send({ book: 'The Great Gatsby' });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('success').to.equal(false);
      expect(response.body).to.have.property('error').to.equal('Duplicate book title');
    });
  });

  describe('DELETE /removeBook', () => {
    it('should remove a book from the library', async () => {
      app.library = ['The Great Gatsby'];

      const response = await chai.request(app).delete('/removeBook').send({ book: 'The Great Gatsby' });

      expect(response).to.have.status(200);
      expect(response.body).to.have.property('success').to.equal(true);
      expect(app.library).to.not.include('The Great Gatsby');
    });

    it('should handle invalid book title for removal', async () => {
      const response = await chai.request(app).delete('/removeBook').send({ book: 123 });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('success').to.equal(false);
      expect(response.body).to.have.property('error').to.equal('Invalid book title');
    });

    it('should handle removal of non-existent book', async () => {
      const response = await chai.request(app).delete('/removeBook').send({ book: 'Nonexistent Book' });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('success').to.equal(false);
      expect(response.body).to.have.property('error').to.equal('Book not found');
    });
  });

  describe('PATCH /updateBook', () => {
    it('should update the name of an existing book', async () => {
      app.library = ['The Great Gatsby'];
  
      const response = await chai
        .request(app)
        .patch('/updateBook')
        .send({ original_book: 'The Great Gatsby', new_book: 'New Name' });
  
      expect(response).to.have.status(200);
      expect(response.body).to.have.property('success').to.equal(true);
      expect(app.library).to.include('New Name');
      expect(app.library).to.not.include('The Great Gatsby');
    });
  
    it('should handle invalid book titles', async () => {
      const response = await chai.request(app).patch('/updateBook').send({ original_book: 123, new_book: 'New Name' });
  
      expect(response).to.have.status(400);
      expect(response.body).to.have.property('success').to.equal(false);
      expect(response.body).to.have.property('error').to.equal('Invalid book titles');
    });
  
    it('should handle updating non-existent book', async () => {
      const response = await chai
        .request(app)
        .patch('/updateBook')
        .send({ original_book: 'Nonexistent Book', new_book: 'New Name' });
  
      expect(response).to.have.status(400);
      expect(response.body).to.have.property('success').to.equal(false);
      expect(response.body).to.have.property('error').to.equal('Book not found');
    });
  
    it('should handle duplicate book title', async () => {
      app.library = ['The Great Gatsby', 'New Name'];
  
      const response = await chai
        .request(app)
        .patch('/updateBook')
        .send({ original_book: 'The Great Gatsby', new_book: 'New Name' });
  
      expect(response).to.have.status(400);
      expect(response.body).to.have.property('success').to.equal(false);
      expect(response.body).to.have.property('error').to.equal('Duplicate book title');
    });
  });
  
  describe('GET /getLibrary', () => {
    it('should retrieve the full contents of the library', async () => {
      app.library = ['The Great Gatsby', 'Moby Dick', 'The Catcher in the Rye'];
  
      const response = await chai.request(app).get('/getLibrary');
  
      expect(response).to.have.status(200);
      expect(response.body).to.have.property('library').to.equal('The Great Gatsby, Moby Dick, The Catcher in the Rye');
    });
  
    it('should handle an empty library', async () => {
      const response = await chai.request(app).get('/getLibrary');
  
      expect(response).to.have.status(200);
      expect(response.body).to.have.property('library').to.equal('');
    });
  
    it('should handle an error during library retrieval', async () => {
      // Set up a scenario where an error occurs during library retrieval
      sinon.stub(console, 'log').throws('Error during library retrieval');
  
      const response = await chai.request(app).get('/getLibrary');
  
      expect(response).to.have.status(500);
      expect(response.body).to.have.property('success').to.equal(false);
      expect(response.body).to.have.property('error').to.equal('Error during library retrieval');
  
      // Restore the console.log function to its original state
      console.log.restore();
    });
  });
  
  describe('PUT /saveToDatabase', () => {
    it('should simulate asynchronous persistence of the current book list to a database', async () => {
      app.library = ['The Great Gatsby', 'Moby Dick', 'The Catcher in the Rye'];
  
      const response = await chai.request(app).put('/saveToDatabase');
  
      expect(response).to.have.status(200);
      expect(response.body).to.have.property('The Great Gatsby').to.be.a('number');
      expect(response.body).to.have.property('Moby Dick').to.be.a('number');
      expect(response.body).to.have.property('The Catcher in the Rye').to.be.a('number');
    });
  
    it('should handle an empty book list', async () => {
      const response = await chai.request(app).put('/saveToDatabase');
  
      expect(response).to.have.status(200);
      expect(response.body).to.deep.equal({});
    });
  
    it('should handle an error during database persistence', async () => {
      // Set up a scenario where an error occurs during database persistence
      sinon.stub(console, 'log').throws('Error during database persistence');
  
      const response = await chai.request(app).put('/saveToDatabase');
  
      expect(response).to.have.status(500);
      expect(response.body).to.have.property('success').to.equal(false);
      expect(response.body).to.have.property('error').to.equal('Error during database persistence');
  
      // Restore the console.log function to its original state
      console.log.restore();
    });
  });
  
});
