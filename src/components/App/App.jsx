import React, { Component } from 'react';
import { Searchbar, ImageGallery, Button, Loader, Modal } from 'components';
import { getPhotos } from 'helpers/api';
import { Container } from './App.styled';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export class App extends Component {
  state = {
    images: [],
    imageUrl: '',
    query: '',
    page: 1,
    isLoading: false,
    showModal: false,
    showLoadMore: false,
  };

  async componentDidUpdate(_, prevState) {
    const { query, page } = this.state;

    if (prevState.query !== query || prevState.page !== page) {
      this.setState({
        isLoading: true,
      });

      try {
        const { hits, totalHits } = await getPhotos(query, page);

        if (!hits.length) {
          this.setState({ showLoadMore: false });
          return toast.warning(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        }

        this.setState({
          showLoadMore: true,
        });

        if (page === 1) {
          toast.success(`Hurray! We found ${totalHits} images.`);
        } else {
          setTimeout(() => {
            window.scrollBy({
              top: window.innerHeight * 0.8,
              behavior: 'smooth',
            });
          }, 400);
        }

        this.setState(prevState => ({
          images: [...prevState.images, ...hits],
        }));

        if (page >= Math.ceil(totalHits / 12)) {
          toast.info(
            `We're sorry, but you've reached the end of search results.`
          );
          this.setState({
            showLoadMore: false,
          });
        } else {
          this.setState({
            showLoadMore: true,
          });
        }
      } catch (error) {
        toast.error('Sorry, something went wrong. Please try again.');
        console.log(error.name);
        console.log(error.message);
      } finally {
        this.setState({ isLoading: false });
      }
    }
  }

  handleSubmit = searchQuery => {
    this.setState({
      images: [],
      query: searchQuery,
      page: 1,
      imageUrl: '',
    });
  };

  toggleModal = () => {
    this.setState(prevState => ({ showModal: !prevState.showModal }));
  };

  handleImgClick = url => {
    this.setState({ imageUrl: url });
    this.toggleModal();
  };

  handleLoadMoreClick = () => {
    this.setState(prevState => ({
      page: prevState.page + 1,
    }));
  };

  render() {
    const { images, isLoading, showModal, showLoadMore, imageUrl } = this.state;
    return (
      <Container>
        <Searchbar onSubmit={this.handleSubmit} />
        {images.length ? (
          <ImageGallery images={images} onClick={this.handleImgClick} />
        ) : null}
        {isLoading && <Loader />}
        {showLoadMore
          ? !isLoading && <Button onClick={this.handleLoadMoreClick} />
          : null}
        {showModal && <Modal onClose={this.toggleModal} url={imageUrl} />}
        <ToastContainer />
      </Container>
    );
  }
}
